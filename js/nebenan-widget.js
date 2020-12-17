let elms = document.querySelectorAll(".nebenan-widget");
Array.prototype.forEach.call(elms, function(el, i){
    let hood = el.dataset.hood;
    let request = new XMLHttpRequest();
    request.open('GET', 'https://api.nebenan.de/api/v2/public_posts.json?hood='+hood.toLowerCase(), true);

    request.onload = function() {
        if (this.status >= 200 && this.status < 400) {
            let data = JSON.parse(this.response);
            let html = '<ul>';
            data.public_posts.forEach(post => {
                let difference = Math.floor((Date.now() - Math.floor(post.content_updated_timestamp/1000)) / 1000 / 60);
                if (difference < 60) {
                    post.age = difference + " Minute" + (difference == 1 ? "" : "n");
                } else if (difference < 24*60) {
                    difference = Math.floor(difference / 60);
                    post.age = difference + " Stunde" + (difference == 1 ? "" : "n");
                }  else {
                    difference = Math.floor(difference / 60 / 24);
                    post.age = difference + " Tag" + (difference == 1 ? "" : "e");
                }

                post.hood = hood;

                switch (post.hood_message_type_id) {
                    case 14:
                        let id = '14.3';
                        if (post.images == undefined || post.images.length == 0)
                            id = '14.0';
                        else if (post.images.length < 3)
                            id = '14.'+post.images.length;
                        html += templates[id](post);
                        break;
                    case 1:
                        html += templates[post.hood_message_type_id](post);
                        break;
                    default:
                        console.log("hood message type "+post.hood_message_type_id+" not supported");
                }
            })
            html += '</ul>';
            el.innerHTML = html;
        } else {
            console.log("error loading nebenan feed "+this.status)
        }
    };

    request.onerror = function() {
        console.log("error connecting to nebenan feed")
    };

    request.send();
});

function sw(offst) {
    let imgs = document.querySelectorAll(".c-image_gallery_modal-image");
    let crrnt = Array.prototype.findIndex.call(imgs, e => e.classList.contains('is-active'))
    let nxt = crrnt == -1 ? 0 : (crrnt + offst + imgs.length) % imgs.length;
    imgs.forEach(e => {
        e.classList.remove('is-active');
    })
    imgs[nxt].classList.add('is-active');
    document.querySelector('.c-image_gallery_modal-state em').innerHTML = "Bild "+(nxt+1);
}

function cm(msg) {
    let cd = 'with(obj){ return \'' +
        msg.replace(/\n/g, '\\n').split(/{{([^{}]+)}}/g).map(function (expression, i) {
            return i % 2 ? ('\'+(' + expression.trim() + ')+\'') : expression;
        }).join('') +
        '\'; }';
    try {
        return new Function('obj', cd);
    } catch(err) {
        console.error("'" + err.message + "'", " in \n\nCode:\n", cd, "\n");
    }
}

function shwGllry(e) {
    let wdgt = document.querySelector(".nebenan-widget");
    let request = new XMLHttpRequest();
    request.open('GET', 'https://api.nebenan.de/api/v2/public_posts/'+e.dataset.id+'.json', true);
    request.onload = function() {
        if (this.status >= 200 && this.status < 400) {
            let data = JSON.parse(this.response);
            let imgs = [];
            data.public_post.images.forEach((img, i) => {
                img.active = (i == e.dataset.no);
                imgs.push(lbImg(img));
            });
            wdgt.insertAdjacentHTML('afterend', lb({images: imgs, no: parseInt(e.dataset.no)+1}))
        } else {
            console.log("error loading nebenan feed "+this.status)
        }
    };
    request.onerror = function() {
        console.log("error connecting to nebenan feed")
    };

    request.send();
}

function hdGllry() {
    Array.prototype.forEach.call(document.querySelectorAll('.c-modal'), e => e.parentNode.removeChild(e) );
}

let templates = {
    1: cm(`<li><article class="nebenan-card"> <header class="nebenan-card-gray">Beitrag</header> <div class="nebenan-card-section"> <div class="nebenan-post"> <header> <h3>{{subject}}</h3> <aside class="item-meta"><span>Aus {{hood}} vor {{age}}</span></aside> </header> <div class="nebenan-post-content"> <article class="nebenan-content">{{body.replace(/\\n/g, "<br />")}}</article> </div></div></div><footer class="nebenan-card-gray"><a href="https://nebenan.de/register">Jetzt registrieren</a></footer> </article> </li>`),
    '14.0': cm(`<li><article class="nebenan-card"> <header class="nebenan-card-gray">Marktplatz-Eintrag</header> <div class="nebenan-card-section"> <div class="nebenan-marketplace"> <h3>{{subject}}</h3> <div class="nebenan-marketplace-content"> <article class="nebenan-content"> <span>{{body.replace(/\\n/g, "<br />")}}</span> </article> </div><aside class="item-meta"><span>Aus {{hood}} vor {{age}}</span></aside> </div></div><footer class="nebenan-card-gray"><a href="/register">Jetzt registrieren</a></footer></article></li>`),
    '14.1': cm(`<li><article class="nebenan-card"> <header class="nebenan-card-gray">Marktplatz-Eintrag</header> <div class="nebenan-card-section"> <div class="nebenan-marketplace"> <h3>{{subject}}</h3> <div class="nebenan-marketplace-content"> <article class="nebenan-gallery"> <div class="nebenan-gallery-preview"> <span data-id="{{id}}" data-no="0" class="nebenan-gallery-image" style="background-image: url({{images[0].url}});" onclick="shwGllry(this)"></span> </div></article> </div><div class="nebenan-marketplace-content"> <article class="nebenan-content"> <span>{{body.replace(/\\n/g, "<br />")}}</span> </article> </div><aside class="item-meta"><span>Aus {{hood}} vor {{age}}</span></aside> </div></div><footer class="nebenan-card-gray"><a href="/register">Jetzt registrieren</a></footer></article></li>`),
    '14.2': cm(`<li><article class="nebenan-card"> <header class="nebenan-card-gray">Marktplatz-Eintrag</header> <div class="nebenan-card-section"> <div class="nebenan-marketplace"> <h3>{{subject}}</h3> <div class="nebenan-marketplace-content"> <article class="nebenan-gallery grid-2"> <div class="nebenan-gallery-preview"> <span data-id="{{id}}" data-no="0" class="nebenan-gallery-image" style="background-image: url({{images[0].url}});" onclick="shwGllry(this)"></span> <span data-id="{{id}}" data-no="1" class="nebenan-gallery-image" style="background-image: url({{images[1].url}});" onclick="shwGllry(this)"></span> </div></article> </div><div class="nebenan-marketplace-content"> <article class="nebenan-content"> <span>{{body.replace(/\\n/g, "<br />")}}</span> </article> </div><aside class="item-meta"><span>Aus {{hood}} vor {{age}}</span></aside> </div></div><footer class="nebenan-card-gray"><a href="/register">Jetzt registrieren</a></footer></article></li>`),
    '14.3': cm(`<li><article class="nebenan-card"> <header class="nebenan-card-gray">Marktplatz-Eintrag</header> <div class="nebenan-card-section"> <div class="nebenan-marketplace"> <h3>{{subject}}</h3> <div class="nebenan-marketplace-content"> <article class="nebenan-gallery grid-3"> <div class="nebenan-gallery-preview"> <span data-id="{{id}}" data-no="0" class="nebenan-gallery-image" style="background-image: url({{images[0].url}});" onclick="shwGllry(this)"></span> <aside> <span data-id="{{id}}" data-no="1" class="nebenan-gallery-image" style="background-image: url({{images[1].url}});" onclick="shwGllry(this)"></span> <span data-id="{{id}}" data-no="2" class="nebenan-gallery-image" style="background-image: url({{images[2].url}});" onclick="shwGllry(this)"></span> </aside> </div></article> </div><div class="nebenan-marketplace-content"> <article class="nebenan-content"> <span>{{body.replace(/\\n/g, "<br />")}}</span> </article> </div><aside class="item-meta"><span>Aus {{hood}} vor {{age}}</span></aside> </div></div><footer class="nebenan-card-gray"><a href="/register">Jetzt registrieren</a></footer></article></li>`),
}
let lb = cm(`<section data-track="modal" class="c-modal c-image_gallery_modal"><div class="c-modal-body"><span class="icon-cross c-modal-close" data-track="modal-close" onclick="hdGllry()">X</span> <article class="nebenan-card"> <header class="nebenan-card-section c-image_gallery_modal-controls"><i class="arrow left c-image_gallery_modal-prev" onclick="sw(-1)"></i><span class="c-image_gallery_modal-state"><em>Bild {{no}}</em>von {{images.length}}</span><i class="arrow right c-image_gallery_modal-next" onclick="sw(1)"></i></header><div class="c-image_gallery_modal-content">{{images.join('')}}</div> <footer class="nebenan-card-section"><span class="ui-link" onclick="hdGllry()">Schließen</span></footer> </article></div> </section>`);
let lbImg = cm(`<img onclick="sw(1)" class="c-image_gallery_modal-image {{active ? "is-active" : ""}}" alt="" src="{{url}}">`);