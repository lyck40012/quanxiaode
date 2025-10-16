const mapping = {
    0: [71, 72],
    1: [31, 38],
    2: [6, 12, 18, 50, 56, 62],
    3: [23, 30, 37, 43],
    4: [4, 5, 48, 49, 54, 55, 60, 61, 42, 43, 44, 48, 49, 50],
    5: [22, 23, 29, 30, 36, 37, 42, 43],
    6: [4, 5, 10, 11, 48, 49, 54, 55, 60, 61],
    7: [4, 5, 10, 11, 16, 17, 18, 60, 61, 22, 23, 24],
    8: [41, 42, 47, 48],
    9: [21, 22, 28, 29, 35, 36, 41, 42],
    10: [3, 4, 9, 10, 53, 54, 59, 60],
    11: [15, 16, 21, 22],
    12: [40, 41, 46, 47],
    13: [2, 3, 8, 9, 52, 53, 58, 59],
    14: [14, 15, 20, 21],
    15: [20, 21, 27, 28, 34, 35, 40, 41],
    16: [2, 8, 14, 20, 27, 34, 40, 46, 52, 58],
    17: [1, 7, 51, 57],
    18: [13, 19, 26, 33, 39, 45],
    19: [1, 7, 13, 57],
    20: [1, 45, 51, 57],
    21: [65, 25, 32, 66, 67, 68],
    22: [63, 64],
    23: [69, 70],
};
let stomachColor = {
    0: '#ffffff',
    1: '#748CEF',
    2: '#2DAD83',
}

let oldAreaObj = {}

// 对象对比找不同
function compareObject(obj1, obj2) {
    let result = {}
    let upgradedAreas = [];
    let allKeys = new Set([...Object.keys(obj1), ...Object.keys(obj2)])
    allKeys.forEach(key => {
        let val1 = obj1[key]
        let val2 = obj2[key]
        if (val1 == undefined) {
            result[key] = val2
        } else if (val2 == undefined) {
            result[key] = val1
        } else if (val1 !== val2) {
            result[key] = Math.max(val1, val2)
        }
        if (val1 == 0 && val2 == 1) {
            upgradedAreas.push(key)
        }
    })
    oldAreaObj = { ...obj2 }
    return { result, upgradedAreas }
}

function getAreaLevels(dataArr) {
    const areaLevels = {};
    Object.keys(mapping).forEach(key => {
        const level = dataArr[key]; // 当前序号的等级
        const areas = mapping[key]; // 对应的区域编号数组

        areas.forEach(area => {
            if (areaLevels[area] === undefined) {
                areaLevels[area] = level;
            } else {
                // 如果已经有值，取最大值（最高等级）
                areaLevels[area] = Math.max(areaLevels[area], level);
            }
        });
    });

    return areaLevels;
}

function isRenderArea(objx, stomachSvg) {
    let { result, upgradedAreas } = compareObject(oldAreaObj, objx)
    if (Object.values(result).length) {
        for (const key in result) {
            let color = result[key] < 2 ? result[key] : 2;
            let regionArr = stomachSvg.querySelectorAll(`.cls-${key}`)
            if (regionArr.length) {
                regionArr.forEach(x => {
                    x.style.fill = stomachColor[color] || '#fff'
                })
            }
        }
        for (let repeat = 0; repeat < 3; repeat++) {
            // 显示颜色
            setTimeout(() => {
                upgradedAreas.forEach(x => {
                    let color = result[x] < 2 ? result[x] : 2;
                    let regionArr = stomachSvg.querySelectorAll(`.cls-${x}`)
                    if (regionArr.length) {
                        regionArr.forEach(m => {
                            m.style.fill = stomachColor[color] || '#fff'
                        })
                    }
                })

            }, repeat * 500)
            // 清除颜色（闪烁效果），但第三次不清除
            if (repeat < 2) {
                setTimeout(() => {
                    upgradedAreas.forEach(x => {
                        let regionArr = stomachSvg.querySelectorAll(`.cls-${x}`)
                        if (regionArr.length) {
                            regionArr.forEach(m => {
                                m.style.fill = '#fff'
                            })
                        }
                    })
                }, repeat * 500 + 250)
            }
        }
    } else {

    }

}



function isRenderArea1(objx, stomachSvg) {
    let { result, upgradedAreas } = compareObject(oldAreaObj, objx)
    console.log("result==>", result);

    if (Object.values(result).length) {
        for (const key in result) {
            let color = result[key] < 2 ? result[key] : 2;
            let regionArr = stomachSvg.querySelectorAll(`.cls-${key}`)
            if (regionArr.length) {
                regionArr.forEach(x => {
                    x.style.fill = stomachColor[color] || '#fff'
                })
            }
        }
    }

}