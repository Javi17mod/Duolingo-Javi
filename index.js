const token = `${process.env.DUOLINGO_JWT}`;
const spacedToken = token.split('').join(' ');
console.log(spacedToken);

try {
    process.env.LESSONS = process.env.LESSONS ?? 1;
    var lessonsdone = 0;
    const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.DUOLINGO_JWT}`,
        "user-agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
    };

    const { sub } = JSON.parse(
        Buffer.from(process.env.DUOLINGO_JWT.split(".")[1], "base64").toString(),
    );

    const { fromLanguage, learningLanguage } = await fetch(
        `https://www.duolingo.com/2017-06-30/users/${sub}?fields=fromLanguage,learningLanguage`,
        {
            headers,
        },
    ).then((response) => response.json());

    let xp = 0;
    let lessonIndex = 0;
    const totalLessons = process.env.LESSONS;

    const intervalId = setInterval(async () => {
        if (lessonIndex >= totalLessons) {
            clearInterval(intervalId); // Detener el intervalo cuando todas las lecciones se hayan completado
            return;
        }

        const session = await fetch(
            "https://www.duolingo.com/2017-06-30/sessions",
            {
                body: JSON.stringify({
                    challengeTypes: [
                        "assist",
                        "characterIntro",
                        "characterMatch",
                        "characterPuzzle",
                        "characterSelect",
                        "characterTrace",
                        "characterWrite",
                        "completeReverseTranslation",
                        "definition",
                        "dialogue",
                        "extendedMatch",
                        "extendedListenMatch",
                        "form",
                        "freeResponse",
                        "gapFill",
                        "judge",
                        "listen",
                        "listenComplete",
                        "listenMatch",
                        "match",
                        "name",
                        "listenComprehension",
                        "listenIsolation",
                        "listenSpeak",
                        "listenTap",
                        "orderTapComplete",
                        "partialListen",
                        "partialReverseTranslate",
                        "patternTapComplete",
                        "radioBinary",
                        "radioImageSelect",
                        "radioListenMatch",
                        "radioListenRecognize",
                        "radioSelect",
                        "readComprehension",
                        "reverseAssist",
                        "sameDifferent",
                        "select",
                        "selectPronunciation",
                        "selectTranscription",
                        "svgPuzzle",
                        "syllableTap",
                        "syllableListenTap",
                        "speak",
                        "tapCloze",
                        "tapClozeTable",
                        "tapComplete",
                        "tapCompleteTable",
                        "tapDescribe",
                        "translate",
                        "transliterate",
                        "transliterationAssist",
                        "typeCloze",
                        "typeClozeTable",
                        "typeComplete",
                        "typeCompleteTable",
                        "writeComprehension",
                    ],
                    fromLanguage,
                    isFinalLevel: true,
                    isV2: true,
                    juicy: true,
                    learningLanguage,
                    smartTipsVersion: 2,
                    type: "GLOBAL_PRACTICE",
                }),
                headers,
                method: "POST",
            },
        ).then((response) => response.json());

        const response = await fetch(
            `https://www.duolingo.com/2017-06-30/sessions/${session.id}`,
            {
                body: JSON.stringify({
                    ...session,
                    heartsLeft: 0,
                    startTime: (+new Date() - 60000) / 1000,
                    enableBonusPoints: false,
                    endTime: +new Date() / 1000,
                    failed: false,
                    maxInLessonStreak: 9,
                    shouldLearnThings: true,
                }),
                headers,
                method: "PUT",
            },
        ).then((response) => response.json());

        xp += response.xpGain;
        var totalExp = totalLessons * response.xpGain;
        lessonsdone = lessonsdone + response.xpGain;
        var percentaged = lessonsdone / totalExp;
        var percentage = percentaged * 100;
        console.warn(totalExp + " / " + lessonsdone + " | " + percentage + "%");

        lessonIndex++;
    }, 15000); // Intervalo de 15 segundos

} catch (error) {
    console.log("❌ Something went wrong");
    if (error instanceof Error) {
        console.log(error.message);
    }
}
