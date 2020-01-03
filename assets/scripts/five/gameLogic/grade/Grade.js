
let Grade = {
    // safeScore // from SC2. the score to prevent rank loose, not sure to use it or not
    grades: [
        {
            grade: 1,
            name: "初心一段",
            exp: 500,
            isBottom: true,
        },
        {
            grade: 2,
            name: "入门二段",
            exp: 550,
        },
        {
            grade: 3,
            name: "小成三段",
            exp: 600,
        },
        {
            grade: 4,
            name: "潜心四段",
            exp: 700,
        },
        {
            grade: 5,
            name: "大成五段",
            exp: 800,
        },
        {
            grade: 6,
            name: "至纯六段",
            exp: 950,
        },
        {
            grade: 7,
            name: "入神七段",
            exp: 1100,
        },
        {
            grade: 8,
            name: "半仙八段",
            exp: 1300,
        },
        {
            grade: 9,
            name: "超神九段",
            exp: 1600,
        },
        {
            grade: 10,
            name: "一心十段",
            exp: 2000,
            isTop: true,
        },
    ],

    gradeMatchModifier: [
        {
            existB: 0,
            exist: 0,
            fail: 0,
            newB: 50,
            new: 50,
        },
        {
            existB: 25,
            exist: 25,
            fail: 0,
            newB: 25,
            new: 25,
        },
        {
            existB: 13,
            exist: 5,
            fail: 2,
            newB: 40,
            new: 40,
        },
        {
            existB: 12,
            exist: 11,
            fail: 2,
            newB: 35,
            new: 40,
        },
        {
            existB: 13,
            exist: 15,
            fail: 2,
            newB: 35,
            new: 35,
        },
        {
            existB: 13,
            exist: 15,
            fail: 2,
            newB: 35,
            new: 35,
        },
        {
            existB: 13,
            exist: 16,
            fail: 1,
            newB: 30,
            new: 40,
        },
        {
            existB: 13,
            exist: 26,
            fail: 1,
            newB: 25,
            new: 35,
        },
        {
            existB: 15,
            exist: 29,
            fail: 1,
            newB: 20,
            new: 35,
        },
        {
            existB: 20,
            exist: 29,
            fail: 1,
            newB: 15,
            new: 35,
        },
    ],

    getGradeAndFillInfoByScore(score) {
        let base = 0;
        let fillTop = 1;
        let fillBottom = 0;
        let fillAmount = 0;
        let grade = 1;
        for (let i in this.grades) {
            if (score >= base) {
                grade = this.grades[i].grade;
                fillBottom = base;
                break;
            }

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

    getGradeInfo: function (gradeValue) {
        let info = this.grades[gradeValue];
        if (info) {
            let res = {};
            res.imgPath = "images/gradeImg/grade" + gradeValue;
            for (let i in info) { res[i] = info[i]; }
            return res;
        }
    },

    getGradeMatchModifier(){

    },
};

module.exports = Grade;