// ==UserScript==
// @name         StackEdit Plugin
// @namespace    http://www.a23187.cn/
// @version      1.0.0
// @description  PicToUrl + Sync with OneDrive
// @author       A23187
// @match        https://stackedit.io
// @match        https://stackedit.io/app
// @match        https://stackedit.io/app?*
// @grant        none
// ==/UserScript==

const notifier = {
    __notify: (type, msg) => {
        const d = [
            /* err  */ 'M 13 14 L 11 14 L 11 9.99998 L 13 9.99998 M 13 18 L 11 18 L 11 16 L 13 16 M 1 21 L 23 21 L 12 1.99998 L 1 21 Z',
            /* info */ 'M 12.9994 8.99805 L 10.9994 8.99805 L 10.9994 6.99805 L 12.9994 6.99805 M 12.9994 16.998 L 10.9994 16.998 L 10.9994 10.998 L 12.9994 10.998 M 11.9994 1.99805 C 6.47642 1.99805 1.99943 6.47504 1.99943 11.998 C 1.99943 17.5211 6.47642 21.998 11.9994 21.998 C 17.5224 21.998 21.9994 17.5211 21.9994 11.998 C 21.9994 6.47504 17.5224 1.99805 11.9994 1.99805 Z',
            /* ok   */ 'M 12,2C 17.5228,2 22,6.47716 22,12C 22,17.5228 17.5228,22 12,22C 6.47715,22 2,17.5228 2,12C 2,6.47716 6.47715,2 12,2 Z M 10.9999,16.5019L 17.9999,9.50193L 16.5859,8.08794L 10.9999,13.6739L 7.91391,10.5879L 6.49991,12.0019L 10.9999,16.5019 Z'
        ];

        var parent = document.getElementsByClassName('notification')[0];
        var element = document.createElement('div');
        const id = Date.now();

        parent.appendChild(element);
        element.outerHTML = `
        <div id="${id}" class="notification__item flex flex--row flex--align-center">
            <div class="notification__icon flex flex--column flex--center">
                <svg xmlns="http://www.w3.org/2000/svg" class="icon" viewBox="0 0 24 24"><path d="${d[type]}" /></svg>
            </div>
            <div class="notification__content">${msg}</div>
        </div>`;

        setTimeout(() => {
            parent.removeChild(document.getElementById(id));
        }, 2000);
    },
    err: msg => notifier.__notify(0, msg),
    info: msg => notifier.__notify(1, msg),
    ok: msg => notifier.__notify(2, msg)
};

async function uploadPic(pic) {
    notifier.info('Upload Pic ...');
    var body = new FormData();
    body.append('smfile', pic); // only support sm.ms api currently TODO

    const {code, msg, data} = await fetch('https://sm.ms/api/upload', {
        method: 'POST',
        body: body
    }).then(response => {
        return response.json();
    });
    if(code === 'success') {
        return data.url;
    } else {
        notifier.err('Fail to upload picture.');
    }
}

function insertUrlToEditor(url) {
    if(!url) return;
    var text = `![image](${url})`;
    const selection = window.getSelection();
    if(!selection.rangeCount) return;

    // delete the original text chosen, if has.
    selection.deleteFromDocument();

    // create text node and insert it into current cursor position
    const node = document.createTextNode(text);
    selection.getRangeAt(0).insertNode(node);

    // select the sub text 'image', which will be modified
    const range = document.createRange();
    range.setStart(node, 2); // 2 - length of '!['
    range.setEnd(node, 7); // 7 - length of '![image'
    selection.removeAllRanges();
    selection.addRange(range);
}

function isPic(info) {
    return info.type.match(/^image\/.+$/i);
}

function onPaste(event) {
    const items = (event.clipboardData || event.originalEvent.clipboardData).items;
    for(let i in items) {
        var item = items[i];
        if(isPic(item)) {
            uploadPic(item.getAsFile()).then(url => insertUrlToEditor(url));
            break;
        }
    }
}

function onDrop() {
    // prevent the browser's default behavior and stop the propagation of all events
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(name => {
        window.addEventListener(name, event => {
            event.preventDefault();
            event.stopPropagation();
        });
    });

    return event => {
        var files = event.dataTransfer.files;
        ([...files]).forEach(file => {
            if(isPic(file)) {
                uploadPic(file).then(url => insertUrlToEditor(url));
            } else { // TODO if the file is a md or other plain text, to import it into editor
                notifier.err('Only pictures are allowed.');
            }
        });
    };
}

const doc = {
    // return the name (dirname+basename) of the doc currently being edited
    name: () => {
        var root = document.getElementsByClassName('explorer__tree')[0].firstElementChild;
        var elem = document.getElementsByClassName('explorer-node--selected')[0];

        // when the item selected is a folder not a doc, need special treatment
        if(elem.getAttribute('class').indexOf('folder') != -1) {
            var explorer = document.getElementsByClassName('layout__panel layout__panel--explorer')[0];
            if(explorer.getAttribute('aria-hidden') === 'true') {
                document.getElementsByClassName('navigation-bar__button--explorer-toggler')[0].click();
            }
            notifier.info('Please select a file not a folder from explorer.');
            return;
        }

        var name = '';
        while(elem != root) {
            var temp = elem.firstElementChild.innerText.trim();
            if(name != '' && temp[temp.length - 1] == '.') {
                notifier.err('The folder\'s name can not end with "."');
                return;
            }
            if(temp.match(/[/\\*<>?:|]/)) {
                notifier.err('The name of file/folder can\'t contain illegal chars (/\\*<>?:|).');
                return;
            }

            name = temp + '/' + name;
            elem = elem.closest('.explorer-node__children').closest('.explorer-node--folder');
        }
        return name.replace(/\/$/, '');
    },

    // return the content of the doc currently being edited
    content: () => {
        return document.getElementsByTagName('pre')[0].innerText;
    }
};

function onClick(event) {
    if(event.detail < 2) return;

    var attr = event.target.getAttribute('class');
    if(!attr || attr.indexOf('folder') != -1) return;

    if(attr.indexOf('explorer-node__item') != -1) {
        var node = event.target.closest('.explorer-node');
        if(node.getAttribute('class').indexOf('folder') != -1) return;

        syncer.get(doc.name());
    }
}

function onKeyDown() {
    const ctrl = 17, alt = 18, n = 78, s = 83;
    var prev = -1;

    return event => {
        if(!document.getElementsByClassName('editor').length) return;

        if(event.keyCode === s) {
            if(prev === ctrl) {
                var name = doc.name();
                if(name) {
                    syncer.put(doc.name(), doc.content());
                }
            } else if(prev === alt) {
                syncer.put();
            }
        }

        if(event.keyCode === n && prev === alt) {
            // TODO new a doc by press Alt + N
            console.log('Alt + n');
        }

        prev = event.keyCode;
    }
}

const addCss = (() => {
    const head = document.head || document.getElementsByTagName('head')[0];
    const style = document.createElement('style');

    style.type = 'text/css';
    head.appendChild(style);

    return css => style.appendChild(document.createTextNode(css));
})();

const syncer = (() => {
    const clientId = '983e2014-c7ab-43e5-8da3-bd8514194894';
    const clientSecret = 'IK6T24T1fQKE%3ai-%5bIhvFL%3ac8mIjznq.n'; // client_secret url-encoded

    const redirectUrl = 'https://stackedit.io/app'; // must match the urls configured in Azure Portal.
    const corsProxy = 'https://cors-anywhere.herokuapp.com/'; // cors proxy (see more here: https://github.com/Rob--W/cors-anywhere)
    const authUrl = corsProxy + 'https://login.microsoftonline.com/common/oauth2/v2.0/token';
    const baseUrl = 'https://graph.microsoft.com/v1.0/me/drive/special/approot';

    var accessToken, refreshToken;
    var timer = 0;

    const helper = {
        login: () => {
            var a = document.createElement('a');
            a.setAttribute('href',
                `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${clientId}&\
                scope=files.readwrite%20offline_access&response_type=code&redirect_uri=${redirectUrl}`
            );
            a.click();
        },
        auth: (code) => {
            fetch(authUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: `client_id=${clientId}&client_secret=${clientSecret}&redirect_uri=${redirectUrl}&\
                    grant_type=${code ? 'authorization_code' : 'refresh_token'}&` +
                    (code ? `code=${code}` : `refresh_token=${refreshToken}`)
            }).then(
                response => response.json()
            ).then(data => {
                accessToken = data.access_token;
                refreshToken = data.refresh_token;
            });
        },
        logout: () => {
            // TODO Sign the user out
            // (see more here: docs.microsoft.com/zh-cn/onedrive/developer/rest-api/getting-started/graph-oauth?view=odsp-graph-online#sign-the-user-out)
        },
        startAnm: () => {
            var elem = document.getElementsByClassName('navigation-bar__button--sync')[0];
            elem.removeAttribute('disabled');
            elem.style.animationPlayState = 'running';
        },
        stopAnm: () => {
            var elem = document.getElementsByClassName('navigation-bar__button--sync')[0];
            elem.style.animationPlayState = 'paused';
            elem.setAttribute('disabled', 'disabled');
        }
    }

    const ret = {
        init: () => {
            var url = new URL(window.location.href);
            var code = url.searchParams.get('code');
            code ? helper.auth(code) : helper.login();

            // re-auth when token expires.
            var timer = window.setInterval(() => {
                refreshToken ? helper.auth() : window.clearInterval(timer)
            }, 2880000); // 2880000ms = 80% * 3600s * 1000, token's life is 3600s.

            addCss(`.navigation-bar__button--sync { animation: rotation 1s infinite paused linear; }
                @keyframes rotation {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }`
            );

            ret.put();
        },
        put: (name, content) => {
            if(!name) {
                if(timer) {
                    window.clearInterval(timer);
                    timer = 0;
                    notifier.info('Automatic sync is turned off.');
                } else {
                    timer = window.setInterval(() => {
                        var name = doc.name();
                        if(name) {
                            ret.put(name, doc.content());
                        }
                    }, 300000); // 300000ms = 5min
                    notifier.info('Automatic sync is turned on.');
                }
                return;
            }

            helper.startAnm();

            fetch(baseUrl + ':/' + name + '.md:/content', {
                method: 'PUT',
                headers: {
                    'Authorization': `bearer ${accessToken}`,
                    'Content-Type': 'text/plain'
                },
                body: content
            }).then(
                response => response.json()
            ).then(data => {
                var err = data.error;
                if(err) {
                    notifier.err('Fail to sync, see more info in console.');
                    console.error('Error:\n', JSON.stringify(err));
                } else {
                    // TODO save some info about the last synced doc in onedrive
                }

                helper.stopAnm();
            });
        },
        get: (name) => {
            helper.startAnm();

            fetch(corsProxy + baseUrl + ':/' + name + '.md:/content', {
                method: 'GET',
                headers: { 'Authorization': `bearer ${accessToken}` }
            }).then(
                response => response.ok ? response.text() : response.json()
            ).then(data => {
                var err = data.error;
                if(err) {
                    notifier.err('Fail to backup, see more info in console.');
                    console.error('Error:\n', JSON.stringify(err));
                } else {
                    // clear the editor and then insert data to editor
                    var pre = document.getElementsByTagName('pre')[0];
                    pre.innerHTML = '<div class="cledit-section"><span class="lf"><br><span class="hd-lf" style="display: none"></span></span></div>';
                    pre.focus(); // !!!
                    const selection = window.getSelection();
                    const node = document.createTextNode(data);
                    selection.getRangeAt(0).insertNode(node);
                }

                helper.stopAnm();
            });
        },
        token: () => {
            return accessToken;
        }
    };

    return ret;
})();

(function() {
    'use strict';
    if(document.location.pathname == '/') {
        document.location = document.location.origin + '/app';
        return;
    }

    window.addEventListener('paste', onPaste);
    window.addEventListener('drop', onDrop());

    syncer.init();
    document.addEventListener('click', onClick);
    document.addEventListener('keydown', onKeyDown());
})();