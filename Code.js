function postJobs() {
    const BOT_TOKEN = PropertiesService.getScriptProperties().getProperty('BOT_TOKEN')
    const CHANNEL_NAME = 'michaelpageinterim'
    const LAST_ID_KEY = 'lastId'
    const REGEX = /<h3><a href="(.*?)".*id="job-(.*?)"\s*>(.*)<\/a>[\s\S]*?job-location[\s\S]*?<\/i>([\s\S]+?)<\/div>[\s\S]*?job_advert__job-summary-text">([\s\S]+?)<\/div>[\s\S]*?<ul>([\s\S]+?)<\/ul>/g
    const MP_JOBPAGE_URL = 'https://www.michaelpage.de/jobs/information-technology?contract=temp&sort_by=most_recent'

    const html = UrlFetchApp.fetch(MP_JOBPAGE_URL).getContentText()

    let re, nextIdSet = false
    const lastId = parseInt(PropertiesService.getScriptProperties().getProperty(LAST_ID_KEY) || '0')

    while (re = REGEX.exec(html)) {
        let entry = {
            url: 'https://www.michaelpage.de' + re[1],
            id: parseInt(re[2]),
            title: re[3].replace(/&amp;/g, '&').trim(),
            loc: re[4].trim(),
            desc: re[5]
                .replace(/<br \/>/g, ' ')
                .replace(/&amp;/g, '&')
                .replace(/<\/p>/g, ' ')
                .replace(/<.*?>/g, '')
                .replace(/\s+/g, ' ')
                .trim() + '\n\n' + re[6]
                .replace(/&amp;/g, '&')
                .replace(/\s*<li>/g, '- ')
                .replace(/<\/li>/g, '\n')
                .trim()
        }

        if (entry.id <= lastId) break
        if (!nextIdSet) {
            nextIdSet = true
            PropertiesService.getScriptProperties().setProperty(LAST_ID_KEY, entry.id.toString())
        }

        const text = encodeURIComponent(`JobID: <code>${entry.id}</code>\n\n<a href="${entry.url}"><b>${entry.title}</b></a>\n\n${entry.desc}`)
        UrlFetchApp.fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage?chat_id=@${CHANNEL_NAME}&text=${text}&parse_mode=HTML&disable_web_page_preview=1`)
    }
}
