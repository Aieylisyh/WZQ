
let Grade = {
    grades: {
        grade1: 1,

        grade2: 2,

        grade3: 3,

        grade4: 4,

        grade5: 5,

        grade6: 6,

        grade7: 7,

        grade8: 8,

        grade9: 9,

        grade10: 10,
    },

    getGradeInfo: function (gradeValue) {
        let res = {};
        res.value = gradeValue;
        res.imgPath = "images/gradeImg/grade" + gradeValue;


        switch (gradeValue) {
            case this.grades.grade1:
                res.name = "初出茅庐";
                res.exp = 600;
                res.isBottom = true;
                break;

            case this.grades.grade2:
                res.name = "路边棋手";
                res.exp = 900;
                break;

            case this.grades.grade3:
                res.name = "略有小成";
                res.exp = 1200;
                break;

            case this.grades.grade4:
                res.name = "驾轻就熟";
                res.exp = 1300;
                break;

            case this.grades.grade5:
                res.name = "出类拔萃";
                res.exp = 1500;
                break;

            case this.grades.grade6:
                res.name = "炉火纯青";
                res.exp = 1700;
                break;

            case this.grades.grade7:
                res.name = "神乎其技";
                res.exp = 1800;
                break;

            case this.grades.grade8:
                res.name = "出神入化";
                res.exp = 2000;
                break;

            case this.grades.grade9:
                res.name = "人棋合一";
                res.exp = 2500;
                break;

            case this.grades.grade10:
                res.name = "已臻化境";
                res.exp = -1;
                res.isTop = true;
                break;

            default:
                return null;
        }

        return res;
    },
};

module.exports = Grade;