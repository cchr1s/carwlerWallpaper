const superagent = require('superagent')
const cheerio = require('cheerio')
const request = require('request')
const fs = require('fs')
const random_ua = require('random-ua')

/**
 * @description personal configuration
 */
const standardRank = 35 // 0-50
const ratio = '2560x1440'
const savePath = 'c:/Users/jaylen/Desktop/dc'
const target = []
const ranking = []
const page = 1 // 爬取1页，多了ip被锁定

/**
 * @param {String} exampleUrl 'http://wallpaperswide.com/girls-desktop-wallpapers/page/31'
 */
const urls = Array.from({length: page}, (v,k) => k).map((item) => {
    return `http://wallpaperswide.com/girls-desktop-wallpapers/page/${item + 44}`
})

clearUnless(savePath) // 删除ratio不相符的
urls.map((item) => {
    carwler(item)   
})

function carwler (url) {
    superagent
        .get(url)
        .set({
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
            'Accept-Encoding': 'gzip, deflate',
            'Accept-Language': 'zh-CN,zh;q=0.9',
            'Cache-Control': 'max-age=0',
            'Connection': 'keep-alive',
            'Cookie': cookie,
            'Host': 'wallpaperswide.com',
            'Referer': url,
            'Upgrade-Insecure-Requests': 1,
            'User-Agent': random_ua.generate()
        })
        .end((err, res) => {
            if (err) {
                return Error (err)
                console.log(err)
            }
            
            let $ = cheerio.load(res.text)
            const imgUrl = $('#content').find('.wallpapers').find('.wall').find('.thumb').find('.mini-hud').find('a')
            const rating = $('#content').find('.wallpapers').find('.wall').find('.thumb').find('.current-rating')
            rating.map((index, item) => {
                ranking.push(item.attribs.style.replace(/[^0-9.]/ig, '') - 0)
            })
            imgUrl.map((index, item) => {
                if (ranking[index] > standardRank) {
                    target.push({
                        url: item.attribs.href
                    })
                }
            })
            
            target.map((item) => {
                // 'http://wallpaperswide.com/download/miss_tuning-wallpaper-2560x1440.jpg'
                const url = `http://wallpaperswide.com/download${item.url.slice(0, -6)}-${ratio}.jpg`
                const name = `${item.url.slice(0, -6)}-${ratio}.jpg`
                const randerTime = Math.ceil(Math.random() * 10) * 1000 
                try {
                    setTimeout(() => download(url, savePath, name), randerTime)
                } catch (error) {
                    console.log (error)
                }
            })
            
    })
}

function download(src, path, name) {
    request(src)
        .pipe(fs.createWriteStream(`${path}/${name}`))
        .on('close', () => console.log('complete'))
}

function clearUnless(path) {
    fs.readdir(path, (err, files) => {
        if (err) return console.log(err);
        if(files){
            files.map((file) => {
                fs.stat(`${path}/${file}`, (err, stats) => {
                    if(err) console.log(err)
                    if (stats.size < 100000) {
                        fs.unlink(`${path}/${file}`, function (err) {
                            if (err) throw err;
                            console.log('delete not 2k')
                        })
                    }
                })
            })
        }
    })
}

