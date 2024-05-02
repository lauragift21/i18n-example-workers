import parser from 'accept-language-parser'
// do not set to true in production!
const DEBUG = false

const strings = {
  de: {
    title: 'Beispielseite',
    headline: 'Beispielseite',
    subtitle:
      'Dies ist meine Beispielseite. Abhängig davon, wo auf der Welt Sie diese Site besuchen, wird dieser Text in die entsprechende Sprache übersetzt.',
    disclaimer:
      'Haftungsausschluss: Die anfänglichen Übersetzungen stammen von Google Translate, daher sind sie möglicherweise nicht perfekt!',
    tutorial:
      'Das Tutorial für dieses Projekt finden Sie in der Cloudflare Workers-Dokumentation.',
    copyright: 'Design von HTML5 UP.',
  },
  jp: {
    title: 'サンプルサイト',
    headline: 'サンプルサイト',
    subtitle:
      'これは私の例のサイトです。 このサイトにアクセスする世界の場所に応じて、このテキストは対応する言語に翻訳されます。',
    disclaimer:
      '免責事項：最初の翻訳はGoogle翻訳からのものですので、完璧ではないかもしれません！',
    tutorial:
      'Cloudflare Workersのドキュメントでこのプロジェクトのチュートリアルを見つけてください。',
    copyright: 'HTML5 UPによる設計。',
  },
}

class ElementHandler {
  constructor(countryStrings) {
    this.countryStrings = countryStrings
  }

  element(element) {
    const i18nKey = element.getAttribute('data-i18n-key')
    if (i18nKey) {
      const translation = this.countryStrings[i18nKey]
      if (translation) {
        element.setInnerContent(translation)
      }
    }
  }
}

export async function onRequestPost({ request }) {
  const url = new URL(request.url)
  try {
    let options = {}
    if (DEBUG) {
      options = {
        cacheControl: {
          bypassCache: true,
        },
      }
    }
    const languageHeader = request.headers.get('Accept-Language')
    const language = parser.pick(['de', 'jp'], languageHeader)
    const countryStrings = strings[language] || {}

    // what is the response now?
    const response = await getAssetFromKV(request, options)

    return new HTMLRewriter()
      .on('[data-i18n-key]', new ElementHandler(countryStrings))
      .transform(response)
  } catch (e) {
    if (DEBUG) {
      return new Response(e.message || e.toString(), {
        status: 404,
      })
    } else {
      return new Response(`"${url.pathname}" not found`, {
        status: 404,
      })
    }
  }
  
}