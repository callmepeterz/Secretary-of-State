module.exports = {
    fxList: [
        {
            matchDomains: ["twitter.com", "x.com"],
            matchPaths: [],
            preservesSubdomains: false,
            preservesWWW: false,
            replacementDomains: ["fxtwitter.com", "girlcockx.com", "hotyurisex.com", "yaoisex.com", "boypussyx.com", "mpregx.com", "faggotx.com"],
            removedSearchParams: ["s", "t", "twclid", "a"],   
        },
        {
            matchDomains: ["instagram.com"],
            matchPaths: [],
            preservesSubdomains: false,
            preservesWWW: false,
            replacementDomains: ["oginstagram.com"],
            removedSearchParams: ["obrf", "igshid", "igsh", "dlrf", "rpxt", "xtok", "exln"]
        },
        {
            matchDomains: ["facebook.com"],
            matchPaths: [],
            preservesSubdomains: false,
            preservesWWW: false,
            replacementDomains: ["facebed.seria.moe"],
            removedSearchParams: ["fbclid", "mibextid", "fbadid", "meta_placement", "meta_site_source"]
        },
        {
            matchDomains: ["tiktok.com"],
            matchPaths: [],
            preservesSubdomains: true,
            preservesWWW: false,
            replacementDomains: ["tnktok.com"],
            removedSearchParams: ["ttclid"]
        },
        {
            matchDomains: ["youtube.com"],
            matchPaths: ["/shorts"],
            preservesSubdomains: false,
            preservesWWW: false,
            replacementDomains: ["koutube.com"],
            removedSearchParams: ["si", "is"]
        },
        {
            matchDomains: ["youtube.com"],
            matchPaths: [],
            preservesSubdomains: true,
            preservesWWW: true,
            replacementDomains: ["youtube.com"],
            removedSearchParams: ["si", "is"]
        },
        {
            matchDomains: ["youtu.be"],
            matchPaths: [],
            preservesSubdomains: true,
            preservesWWW: true,
            replacementDomains: ["youtu.be"],
            removedSearchParams: ["si", "is"]
        },
        {
            matchDomains: ["threads.com"],
            matchPaths: [],
            preservesSubdomains: false,
            preservesWWW: false,
            replacementDomains: ["fixthreads.seria.moe"],
            removedSearchParams: ["xmt", "igshid"]
        },
    ],

    fxGlobalRemovedParams: {
        params: [
            "fbclid",
            "gclid",
            "gclsrc",
            "_ga",
            "mc_cid",
            "mc_eid",
            "_bta_tid",
            "_bta_c",
            "gdfms",
            "gdftrk",
            "gdffi",
            "_ke",
            "sb_referer_host",
            "mkwid",
            "pcrid",
            "ef_id",
            "s_kwcid",
            "msclkid",
            "dm_i",
            "epik",
            "_branch_match_id",
            "mkevt",
            "mkcid",
            "mkrid",
            "campid",
            "toolid",
            "customid",
            "igshid",
            "si",
        ],
        prefixes: [
            "utm_",
            "pk_",
            "sms_",
            "mtm_",
            "matomo_",
            "piwik_",
            "hsa_",
            "trk_",
            "vero_",
            "oly_"
        ],
    }
};
