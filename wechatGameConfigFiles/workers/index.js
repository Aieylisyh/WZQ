//假人，提供以下服务
//出棋 认输 悔棋 互动 掉线
//不会做出系统不支持的行为，比如低段位不能悔棋
var SIZE = 15;

var stopWorker = false;

var getRawSolution = function (param) {
    //随机下一个点,优先下中间
    let rnd = Math.floor(Math.random() * 2);
    if (rnd == 1) {
        rnd = Math.floor(Math.random() * 3);
    }

    let firstTry = getEmptyPointStartFromCenter(param.map, rnd, true);
    if (firstTry != null) {
        return {
            x: firstTry.x,
            y: firstTry.y,
            type: param.type,
        };
    }

    let lastTry = getEmptyPointStartFromCenter(param.map);
    if (lastTry != null) {
        return {
            x: lastTry.x,
            y: lastTry.y,
            type: param.type,
        };
    }
}

//在整个棋盘上搜索一个空的点下棋，优先从中间开始。
//skipDist为从中间检索要跳过的距离，不能保证找到所有空缺
//skipPartialEdge为true时，会每一圈检索时随机跳过一些点，不能保证找到所有空缺
var getEmptyPointStartFromCenter = function (map, skipDist = 0, skipPartialEdge = false) {
    //从中心点开始，依次向外扩散一圈
    let centerNum = Math.floor(SIZE * 0.5);

    for (let distFromCenter = skipDist; distFromCenter <= centerNum; distFromCenter++) {
        let x = centerNum;
        let y = centerNum;

        if (distFromCenter == 0 && map[x][y] == 0) {
            //当distFromCenter为0时，就是中心点，简化计算
            return {
                x: x,
                y: y,
            };
        }

        let sqrSize1 = distFromCenter * 2 + 1;//外边长
        let sqrSize2 = (distFromCenter - 1) * 2 + 1;//内边长

        //1-0 9-1 25-9 49-25 81-49
        //1 8 16 24 32
        let len = sqrSize1 * sqrSize1 - sqrSize2 * sqrSize2;
        let sizePerEdge = sqrSize1 - 1;
        let halfSize = Math.floor(sqrSize1 * 0.5);

        //从左上角开始，依次遍历这一个方形边界的每一个点
        let startIndex = 0;
        if (skipPartialEdge) {
            startIndex = Math.floor(Math.random() * len);
        }

        for (let index = startIndex; index < len; index++) {
            if (index < sizePerEdge) {
                //上
                x += index;
                y += halfSize;
            } else if (index < sizePerEdge * 2) {
                //右
                x += halfSize;
                y += index - sizePerEdge;
            } else if (index < sizePerEdge * 3) {
                //下
                x += index - sizePerEdge * 2;
                y -= halfSize;
            } else if (index < sizePerEdge * 4) {
                //左
                x -= halfSize;
                y += index - sizePerEdge * 3;
            }

            if (map[x][y] == 0) {
                return {
                    x: x,
                    y: y,
                };
            }
        }
    }
}

//board chessboard with colors
//color: 0 empty 1 black 2 white
var getZebraSolution = function (board, color, evaluatingParam) {
    var i, j, k, l, m, n, position, type, line, total_cells, consecutive_cells, empty_sides, best_score,
        cell_score, direction_score, score;

    // iterate through all the board's cells
    best_score = [224, 0, 0];
    for (i = SIZE * SIZE; i--;) {

        // skip to next cell if this cell is owned by the computer
        if (board[i] == color) continue;

        // by default, the best move is the first free cell
        // (position, attack, defense)
        else if (!board[i] && undefined === best_score) best_score = [i, 0, 0];

        // we will give a "score" to the position, based on its surroundings horizontally, vertically and
        // on both diagonals; for example: for a row like 000XXPXX000 (where "0" means empty, "X" represents
        // the opponent's pieces and "P" is the position for which we are determining the "score", we would
        // check 0|00XXP|XX000, 00|0XXPX|X000, 000|XXPXX|000, 000X|XPXX0|00, 000XX|PXX00|0, and then we would
        // do the same on the vertical, and on both diagonals)

        // cell's default score (attack and defense)
        cell_score = [0, 0];

        // the 4 directions to check: vertical, horizontal, diagonal /, diagonal \ (in this order)
        for (j = 4; j--;) {

            // the default score for the direction we're checking
            direction_score = [0, 0];

            // check the 5 possible outcomes, as described above
            // (if we're checking whether the player won, we'll do this iteration only once, checking for 5 in a row)
            for (k = (!board[i] ? 5 : 1); k--;) {

                // initialize the type of cells we're looking for,
                // and the array with the cells on the current direction
                type = board[i] || undefined;
                line = [];

                // check the 5 pieces for each possible outcome, plus the 2 sides
                for (l = 7; l--;) {

                    // used to compute position
                    m = -5 + k + l;
                    n = i % SIZE;

                    if (

                        // vertical
                        ((j === 0 &&
                            (position = i + (SIZE * m)) !== false &&
                            n == position % SIZE) ||

                            // horizontal
                            (j == 1 &&
                                (position = i + m) !== false &&
                                ~~(position / SIZE) == ~~(i / SIZE)) ||

                            // diagonal /
                            (j == 2 &&
                                (position = i - (SIZE * m) + m) !== false &&
                                ((position > i && position % SIZE < n) ||
                                    (position < i && position % SIZE > n) ||
                                    position == i)) ||

                            // diagonal \
                            (j == 3 &&
                                (position = i + (SIZE * m) + m) !== false &&
                                ((position < i && position % SIZE < n) ||
                                    (position > i && position % SIZE > n)) ||
                                position == i)) &&

                        // the position is not off-board
                        position >= 0 && position < SIZE * SIZE &&

                        // the cell is of the same type as the ones we are looking for
                        // or, we are checking the score for an empty cell, the current position is empty,
                        // or is "undefined" (meaning we didn't yet find any non-empty cells)
                        (board[position] == type || (!board[i] && (!board[position] || undefined === type)) ||

                            // or we're just checking the sides
                            !l || l == 6)

                    ) {

                        // add position to the line
                        line.push(position);

                        // if we're not just checking the sides,
                        // this is not an empty cell, and is of the same type as the ones we're looking for,
                        // update the type of cells we're looking for
                        // (we use ^ instead of !=)
                        if (l && l ^ 6 && undefined === type && board[position]) type = board[position];

                        // if the computed position is off-board, but this is a side-cell, save it as "undefined"
                    } else if (!l || l == 6) line.push(undefined);

                    // skip the rest of the test if we found this row to be "non-compliant"
                    // (a different type of cell than the ones we're looking for, one of the 5 cells is off-board)
                    else break;

                }

                // if we added exactly 7 position to our line, and the line is not containing *only* empty cells
                if (line.length == 7 && undefined !== type) {

                    // if we are checking whether the player won, set this flag so that later on we do not
                    // overwrite the value of the cell
                    m = (board[i] ? true : false);

                    // calculate the score when setting the current cell to the same type as the other ones we found
                    board[i] = type;

                    // calculate the number of consecutive cells we get like this
                    // (we'll do this by looking in our "line" array)
                    consecutive_cells = 0; total_cells = 0; empty_sides = 0;

                    // the total number of cells of the same type
                    for (l = 5; l--;) if (board[line[l + 1]] == type) total_cells++;

                    // look to the left of the current cell
                    for (l = line.indexOf(i) - 1; l >= 0; l--)

                        // if the cell is of the same type, increment the number of consecutive cells
                        if (board[line[l]] == type) consecutive_cells++;

                        // otherwise
                        else {

                            // if the adjacent cell is empty, increment the number of empty sides
                            // we have to use === 0 (instead of !) because it can also be "undefined"
                            if (board[line[l]] === 0) empty_sides++;

                            // don't look further
                            break;

                        }

                    // look to the right of the current cell
                    for (l = line.indexOf(i); l < line.length; l++)

                        // if the cell is of the same type, increment the number of consecutive cells
                        if (board[line[l]] == type) consecutive_cells++;

                        // otherwise
                        else {

                            // if the adjacent cell is empty, increment the number of empty sides
                            // we have to use === 0 (instead of !) because it can also be "undefined"
                            if (board[line[l]] === 0) empty_sides++;

                            // don't look further
                            break;

                        }

                    // give a score to the row based on the array below (number of cells/empty sides)
                    if (evaluatingParam != null) {
                        score = evaluatingParam[consecutive_cells >= total_cells ? Math.min(consecutive_cells, 5) - 1 : total_cells - 1][consecutive_cells >= total_cells ? (empty_sides ? empty_sides - 1 : 0) : 0];
                    } else {
                        score = [[0, 1], [2, 3], [4, 12], [10, 64], [256, 256]][consecutive_cells >= total_cells ? Math.min(consecutive_cells, 5) - 1 : total_cells - 1][consecutive_cells >= total_cells ? (empty_sides ? empty_sides - 1 : 0) : 0];
                    }

                    // reset the cell's value (unless we are looking to see if the player won)
                    if (!m) board[i] = 0;

                    // if the player won, update the score
                    else if (score >= 256) score = 1024;

                    // if, so far, this is the best attack/defense score (depending on the value of "type")
                    // for this direction, update it
                    if (score > direction_score[type - 1]) direction_score[type - 1] = score;

                }

            }

            // update the cell's attack and defense score
            // (we simply sum the best scores of all 4 directions)
            for (k = 2; k--;) cell_score[k] += direction_score[k];

        }

        // used below
        j = cell_score[0] + cell_score[1];
        k = best_score[1] + best_score[2];

        // if 
        if (

            // cell's attack + defense score is better than the current best attack and defense score
            (j > k ||

                // or, cell's score is equal to the best score, but computer's move is better or equal to the player's,
                // and the current best move is not *exactly* the same
                (j == k && cell_score[0] >= best_score[1])) &&

            // we're checking the score of an empty cell, or we're checking to see if the player won and he won
            // (we don't update the score when checking if the player won *unless* the player actually won)
            (!board[i] || cell_score[1] >= 1024)

            // update best score (position, attack, defense)
        ) best_score = [i, cell_score[0], cell_score[1]];
    }

    worker.postMessage({ log: best_score, noAutoStop: true });

    if (best_score[1] > 0 || best_score[2] > 0) {
        let result = {}
        result.type = color;
        result.y = best_score[0] % SIZE;
        result.x = ~~(best_score[0] / SIZE);
        result.oppoPro = best_score[3 - color] / 256;
        result.selfPro = best_score[color] / 64;

        return result;
    }
};

worker.onMessage(function (param) {
    try {
        if (param.stop) {
            stopWorker = true;
            worker.postMessage({ log: "stopWorker", noAutoStop: true });
            return;
        }

        stopWorker = false;

        let res;
        if (param.rawSolution !== true) {
            res = getZebraSolution(param.list, param.type, param.evaluatingParam);
        }
       
        if (res != null) {
            if (param.missPlay) {
                let originX = res.x;
                let originY = res.y;
                for (let i = originX - 1; i < originX + 2; i++) {
                    for (let j = originY - 1; j < originY + 2; j++) {
                        if (i < 0 || i >= SIZE) {
                            continue;
                        }

                        if (j < 0 || j >= SIZE) {
                            continue;
                        }

                        if (i == originY && j == originY) {
                            continue;
                        }

                        if (param.map[i][j] == 0) {
                            worker.postMessage({
                                log: "Zebra missPlay",
                                playChess: true,
                                x: i,
                                y: j,
                                type: res.type,
                            });
                            return;
                        }
                    }
                }
            }

            worker.postMessage({
                log: "Zebra",
                playChess: true,
                x: res.x,
                y: res.y,
                type: res.type,
            });
            return;
        }

        res = getRawSolution(param);

        worker.postMessage({
            log: "Raw",
            playChess: true,
            x: res.x,
            y: res.y,
            type: res.type,
        });
        return;

    } catch (e) {
        worker.postMessage({
            error: e + "",
        });
    }
});