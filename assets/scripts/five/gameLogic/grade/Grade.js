
let Grade = {
    // safeScore // from SC2. the score to prevent rank loose, not sure to use it or not
    grades: [
        {
            grade: 1,
            name: "初心一段",
            exp: 200,
            isBottom: true,
        },
        {
            grade: 2,
            name: "入门二段",
            exp: 250,
        },
        {
            grade: 3,
            name: "小成三段",
            exp: 300,
        },
        {
            grade: 4,
            name: "潜心四段",
            exp: 450,
        },
        {
            grade: 5,
            name: "大成五段",
            exp: 650,
        },
        {
            grade: 6,
            name: "至纯六段",
            exp: 950,
        },
        {
            grade: 7,
            name: "如臻七段",
            exp: 1300,
        },
        {
            grade: 8,
            name: "半仙八段",
            exp: 1700,
        },
        {
            grade: 9,
            name: "超神九段",
            exp: 2100,
        },
        {
            grade: 10,
            name: "一心十段",
            exp: 2500,
            isTop: true,
        },
    ],

    gradeMatchModifier: [
        {
            exist: 5,
            fail: 0,
            bUser: 12,
        },
        {
            exist: 8,
            fail: 0,
            bUser: 30,
        },
        {
            exist: 15,
            fail: 0,
            bUser: 20,
        },
        {
            exist: 25,
            fail: 0,
            bUser: 15,
        },
        {
            exist: 30,
            fail: 0,
            bUser: 15,
        },
        {
            exist: 35,
            fail: 0,
            bUser: 15,
        },
        {
            exist: 30,
            fail: 0,
            bUser: 10,
        },
        {
            exist: 20,
            fail: 0,
            bUser: 10,
        },
        {
            exist: 20,
            fail: 0,
            bUser: 10,
        },
        {
            exist: 20,
            fail: 0,
            bUser: 10,
        },
    ],

    getGradeAndFillInfoByScore(score) {
        let base = 0;
        let fillTop = 1;
        let fillBottom = 0;
        let fillAmount = 0;
        let grade = 1;
        for (let i in this.grades) {
            if (score < base) {
                break;
            }

            grade = this.grades[i].grade;
            fillBottom = base;
            base += this.grades[i].exp;
        }

        fillTop = fillBottom + this.grades[grade - 1].exp;
        fillAmount = score - fillBottom;
        if (fillAmount > fillTop) {
            fillAmount = fillTop;
        }

        return {
            fillTop: fillTop,
            fillBottom: fillBottom,
            fillAmount: fillAmount,
            grade: grade,
        };
    },

    getGradeInfo: function (grade) {
        let info = this.grades[grade - 1];
        if (info) {
            let res = {};
            res.imgPath = "images/gradeImg/grade" + grade;
            for (let i in info) { res[i] = info[i]; }
            return res;
        }
    },

    getFitScore(grade) {
        let score = 0;
        for (let i in this.grades) {
            let info = this.grades[i];
            if (info && info.grade < grade) {
                score += info.exp;
            }
        }

        return score;
    },

    getGradeMatchModifier(grade) {
        return this.gradeMatchModifier[grade - 1];
    },

    getScoreByGradeDelta(selfGrade, oppoGrade, isWin) {
        let delta = selfGrade - oppoGrade;
        let sum = selfGrade + oppoGrade;
        let res = (80 + sum * 5) * (1 + delta * 0.15);
        //debug.log(res);
        if (!isWin) {
            res = - res;
        }

        return Math.floor(res);
    },
};

module.exports = Grade;