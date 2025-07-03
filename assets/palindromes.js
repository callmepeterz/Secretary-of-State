/**
 * Original math paper by JAVIER CILLERUELO, FLORIAN LUCA, and LEWIS BAXTER (https://arxiv.org/pdf/1602.06208.pdf)
 * JavaScript code by callmepeterz
 * Please credit the paper authors and me when code is used
 * Thanks
 */

module.exports = function getPalindromes(n, al) {
    let d = getDigits(n);
    let l = d.length;
    let g = 10;
    let m = Math.floor(l / 2);
    let isSpecial;
    let type = "";
    let algorithm = "";
    let adjustment = "";
    let p1, p2, p3;
    let x = [null];
    let y = [null];
    let z = [null];
    let c = [null];

    //return if n is already a palindrome
    if (isPalindrome(d)) {
        type = "Palindrome";
        p1 = d;
        p2 = [0];
        p3 = [0];
        return outputPalindromes(true);
    }

    //for integers with at least 7 digits
    if (l >= 7 || al) {
        // assign a type to n
        let t = getType(d, l, g);
        type = t.type;
        p1 = t.p1;
        p2 = t.p2;
        p3 = t.p3;

        // check if n is a special number
        if (p1.length % 2 === 0 && (d[m - 1] === 0 || d[m] === 0)) isSpecial = true
        else isSpecial = false;

        // the algorithms

        // I
        if (((["A1", "A2", "A3", "A4"].includes(type) && l === 2 * m + 1) || (["A5", "A6"].includes(type) && l === 2 * m) && !isSpecial) || al === "I") {

            //take 1 from m for type A5 and A6
            if (["A5", "A6"].includes(type)) m -= 1;

            algorithm = "I";
            //step 1: choose x1, y1, z1, c1
            x[1] = p1[0];
            y[1] = p2[0];
            z[1] = p3[0];
            c[1] = Math.floor((x[1] + y[1] + z[1]) / g);

            //step 2: define the digits
            x[2] = z[1] <= d[2 * m - 2] - 1 ? D(d[2 * m - 1] - y[1]) : D(d[2 * m - 1] - y[1] - 1);
            y[2] = D(d[2 * m - 2] - z[1] - 1);
            z[2] = D(d[1] - x[2] - y[2] - c[1]);
            c[2] = Math.floor((x[2] + y[2] + z[2] + c[1] - d[1]) / g);


            //step i: define the digits
            for (let i = 3; i <= m; i++) {
                x[i] = z[i - 1] <= d[2 * m - i] - 1 ? 1 : 0;
                y[i] = D(d[2 * m - i] - z[i - 1] - 1);
                z[i] = D(d[i - 1] - x[i] - y[i] - c[i - 1]);
                c[i] = Math.floor((x[i] + y[i] + z[i] + c[i - 1] - d[i - 1]) / g);
            }

            //step m+1: define
            x[m + 1] = 0;

            //check if adjustment is needed

            //not needed

            //1
            if (c[m] === 1) {
                adjustment = "I.1";
                return outputPalindromes();
            }

            //needed

            //2
            else if (c[m] === 0) {
                adjustment = "I.2";
                x[m + 1] = 1;
                return outputPalindromes();
            }

            //3
            else if (c[m] === 2) {
                adjustment = "I.3";
                if (z[m] != g - 1) {
                    y[m] -= 1;
                    z[m] += 1;
                }
                else {
                    x[m + 1] = 1;
                    y[m] -= 1;
                    z[m] = 0;
                }
                return outputPalindromes();
            }
        }

        //II
        else if (((["A1", "A2", "A3", "A4"].includes(type) && l === 2 * m && d[m - 1] !== 0 && d[m] !== 0) || (["A5", "A6"].includes(type) && l === 2 * m + 1 && d[m - 1] !== 0 && d[m] !== 0) && !isSpecial) || al === "II") {
            algorithm = "II";
            //step 1: choose x1, y1, z1, c1
            x[1] = p1[0];
            y[1] = p2[0];
            z[1] = p3[0];
            c[1] = Math.floor((x[1] + y[1] + z[1]) / g);

            //step 2: define the digits
            x[2] = z[1] <= d[2 * m - 3] - 1 ? D(d[2 * m - 2] - y[1]) : D(d[2 * m - 2] - y[1] - 1);
            y[2] = D(d[2 * m - 3] - z[1] - 1);
            z[2] = D(d[1] - x[2] - y[2] - c[1]);
            c[2] = Math.floor((x[2] + y[2] + z[2] + c[1] - d[1]) / g);

            //step i: define the digits
            for (let i = 3; i <= m - 1; i++) {
                x[i] = z[i - 1] <= d[2 * m - i - 1] - 1 ? 1 : 0;
                y[i] = D(d[2 * m - i - 1] - z[i - 1] - 1);
                z[i] = D(d[i - 1] - x[i] - y[i] - c[i - 1]);
                c[i] = Math.floor((x[i] + y[i] + z[i] + c[i - 1] - d[i - 1]) / g);
            }

            //step m: define the digits
            x[m] = 0;
            y[m] = D(d[m - 1] - z[m - 1] - c[m - 1]);
            c[m] = Math.floor((x[m] + y[m] + z[m - 1] + c[m - 1] - d[m - 1]) / g);

            //adjustment step

            //not needed

            //1
            if (c[m] === 1) {
                adjustment = "II.1";
                return outputPalindromes();
            }

            //needed

            //2
            else if (c[m] === 0) {
                //i
                if (y[m] !== 0) {
                    adjustment = "II.2.i";
                    x[m] = 1;
                    y[m] -= 1;
                    return outputPalindromes();
                }

                //ii
                else if (y[m] === 0) {
                    //a
                    if (y[m - 1] !== 0) {
                        adjustment = "II.2.ii.a";
                        x[m] = 1;
                        y[m - 1] -= 1;
                        y[m] = g - 2;
                        z[m - 1] += 1;
                        return outputPalindromes();
                    }

                    //b
                    else if (y[m - 1] === 0 && z[m - 1] !== 0) {
                        adjustment = "II.2.ii.b";
                        y[m - 1] = 1;
                        y[m] = 1;
                        z[m - 1] -= 1;
                        return outputPalindromes();
                    }

                    //c
                    else if (y[m - 1] === 0 && z[m - 1] === 0) {
                        //(0)
                        if (!isSpecial) {
                            adjustment = "II.2.ii.c.(0)";
                            x[m - 1] -= 1;
                            x[m] = 1;
                            y[m - 1] = g - 1;
                            y[m] = g - 4;
                            z[m - 1] = 2;
                            z[m - 3] = 0;
                            return outputPalindromes();
                        }

                        //(1)
                        else {
                            //I
                            if (x[2] !== 0) {
                                adjustment = "II.2.ii.c.(1).I";
                                x[2] -= 1;
                                x[3] = g - 1;
                                y[2] = 1;
                                y[3] = 1;
                                return outputPalindromes();
                            }

                            //II
                            else if (x[2] === 0) {
                                //i
                                if (x[1] === 1) {
                                    adjustment = "II.2.ii.c.(1).II.i";
                                    p1 = [2, 0, 0, 0, 0, 2];
                                    p2 = [1, 1];
                                    p3 = [g - 4];
                                    return outputPalindromes(true);
                                }

                                //ii
                                else if (x[1] !== 1 && y[1] !== g - 1) {
                                    adjustment = "II.2.ii.c.(1).II.ii";
                                    x[1] -= 1;
                                    x[2] = g - 1;
                                    y[1] += 1;
                                    y[3] = g - 2;
                                    z[2] = 1;
                                    return outputPalindromes();
                                }

                                //iii
                                else if (x[1] !== g - 1 && z[1] === y[1] && y[1] === g - 1) {
                                    adjustment = "II.2.ii.c.(1).II.iii";
                                    p1 = [x[1] + 1, 0, 0, 0, 0, x[1] + 1];
                                    p2 = [1, 1];
                                    p3 = [g - 4];
                                    return outputPalindromes(true);
                                }
                            }
                        }
                    }
                }
            }

            //3
            else if (c[m] === 2) {
                adjustment = "II.3";
                x[m] = 1;
                y[m - 1] -= 1;
                y[m] = g - 2;
                z[m - 1] = 0;
                return outputPalindromes();
            }
        }

        //III
        else if (type[0] === "B" && l === 2 * m + 1 && !isSpecial) {
            algorithm = "III";
            //step 1: choose x1, y1, z1, c1
            x[1] = p1[1];
            y[1] = p2[0];
            z[1] = p3[0];
            c[1] = Math.floor((1 + y[1] + z[1]) / g);

            //step 2: define the digits
            x[2] = z[1] <= d[2 * m - 3] - 1 ? D(d[2 * m - 2] - y[1]) : D(d[2 * m - 2] - y[1] - 1);
            y[2] = D(d[2 * m - 3] - z[1] - 1);
            z[2] = D(d[1] - x[1] - y[2] - c[1]);
            c[2] = Math.floor((x[1] + y[2] + z[2] + c[1] - d[1]) / g);

            //step i: define the digits
            for (let i = 3; i <= m - 1; i++) {
                x[i] = z[i - 1] <= d[2 * m - i - 1] - 1 ? 1 : 0;
                y[i] = D(d[2 * m - i - 1] - z[i - 1] - 1);
                z[i] = D(d[i - 1] - x[i - 1] - y[i] - c[i - 1]);
                c[i] = Math.floor((x[i - 1] + y[i] + z[i] + c[i - 1] - d[i - 1]) / g);
            }

            //step m
            x[m] = 0;
            y[m] = D(d[m - 1] - z[m - 1] - x[m - 1] - c[m - 1]);
            let zm = D(d[m - 1] - x[m - 1] - y[m] - c[m - 1])
            c[m] = Math.floor((x[m - 1] + y[m] + zm + c[m - 1] - d[m - 1]) / g);



            //adjustment step

            //not needed

            //1
            if (c[m] === 1) {
                adjustment = "III.1";
                x.splice(1, 0, 1);
                return outputPalindromes();
            }

            //needed

            //2
            else if (c[m] === 0) {
                adjustment = "III.2";
                x[m] = 1;
                x.splice(1, 0, 1);
                return outputPalindromes();
            }

            //3
            else if (c[m] === 2) {
                //i
                if (y[m - 1] !== 0 && z[m - 1] !== g - 1) {
                    adjustment = "III.3.i";
                    y[m - 1] -= 1;
                    y[m] -= 1;
                    z[m - 1] += 1;
                    x.splice(1, 0, 1);
                    return outputPalindromes();
                }

                //ii
                else if (y[m - 1] !== 0 && z[m - 1] === g - 1) {
                    adjustment = "III.3.ii";
                    x[m] = 1;
                    y[m - 1] -= 1;
                    z[m - 1] = 0;
                    x.splice(1, 0, 1);
                    return outputPalindromes();
                }

                //iii
                else if (y[m - 1] === 0 && z[m - 1] !== g - 1) {
                    adjustment = "III.3.iii";
                    x[m - 1] -= 1;
                    y[m - 1] = g - 1;
                    y[m] -= 1;
                    z[m - 1] += 1;
                    x.splice(1, 0, 1);
                    return outputPalindromes();
                }

                //iv
                else if (y[m - 1] === 0 && z[m - 1] === g - 1) {
                    adjustment = "III.3.iv";
                    x[m - 1] -= 1;
                    x[m] = 1;
                    y[m - 1] = g - 1;
                    z[m - 1] = 0;
                    x.splice(1, 0, 1);
                    return outputPalindromes();
                }
            }
        }

        //IV
        else if ((type[0] === "B" && l === 2 * m && d[m] !== 0 && d[m - 1] !== 0 && !isSpecial) || al === "IV") {
            algorithm = "IV";
            //step 1: choose x1, y1, z1, c1
            x[1] = p1[1];
            y[1] = p2[0];
            z[1] = p3[0];
            c[1] = Math.floor((1 + y[1] + z[1]) / g);

            //step 2: define the digits
            x[2] = z[1] <= d[2 * m - 4] - 1 ? D(d[2 * m - 3] - y[1]) : D(d[2 * m - 3] - y[1] - 1);
            y[2] = D(d[2 * m - 4] - z[1] - 1);
            z[2] = D(d[1] - x[1] - y[2] - c[1]);
            c[2] = Math.floor((x[1] + y[2] + z[2] + c[1] - d[1]) / g);

            //step i: define the digits
            for (let i = 3; i <= m - 2; i++) {
                x[i] = z[i - 1] <= d[2 * m - i - 2] - 1 ? 1 : 0;
                y[i] = D(d[2 * m - i - 2] - z[i - 1] - 1);
                z[i] = D(d[i - 1] - x[i - 1] - y[i] - c[i - 1]);
                c[i] = Math.floor((x[i - 1] + y[i] + z[i] + c[i - 1] - d[i - 1]) / g);
            }

            //step i = m - 1
            x[m - 1] = z[m - 2] <= d[m - 1] - 1 ? 1 : 0;
            y[m - 1] = D(d[m - 1] - z[m - 2] - 1);
            z[m - 1] = D(d[m - 2] - x[m - 2] - y[m - 1] - c[m - 2]);
            c[m - 1] = Math.floor((x[m - 2] + y[m - 1] + z[m - 1] + c[m - 2] - d[m - 2]) / g);

            //adjustment step

            //not needed

            //1
            if (x[m - 1] + c[m - 1] === 1) {
                adjustment = "IV.1";
                x.splice(1, 0, 1);
                return outputPalindromes();
            }

            //needed

            //2
            else if (x[m - 1] + c[m - 1] === 0 && y[m - 1] !== g - 1) {
                //i
                if (z[m - 1] !== 0) {
                    adjustment = "IV.2.i";
                    y[m - 1] += 1;
                    z[m - 1] -= 1;
                    x.splice(1, 0, 1);
                    return outputPalindromes();
                }

                //ii
                else if (z[m - 1] === 0 && y[m - 2] !== 0) {
                    //a
                    if (y[m - 1] !== 1 && z[m - 2] !== g - 1) {
                        adjustment = "IV.2.ii.a";
                        x[m - 1] = 1;
                        y[m - 2] -= 1;
                        y[m - 1] -= 1;
                        z[m - 2] += 1;
                        z[m - 1] = 1;
                        x.splice(1, 0, 1);
                        return outputPalindromes();
                    }

                    //b
                    else if (y[m - 1] !== 1 && z[m - 2] === g - 1) {
                        adjustment = "IV.2.ii.b";
                        x[m - 1] = 2;
                        y[m - 2] -= 1;
                        y[m - 1] -= 2;
                        z[m - 2] = 0;
                        z[m - 1] = 3;
                        x.splice(1, 0, 1);
                        return outputPalindromes();
                    }

                    //c
                    else if (y[m - 1] === 1) {
                        adjustment = "IV.2.ii.c";
                        x[m - 1] = 1;
                        y[m - 2] -= 1;
                        y[m - 1] = g - 1;
                        z[m - 2] = 0;
                        z[m - 1] = 3;
                        x.splice(1, 0, 1);
                        return outputPalindromes();
                    }
                }

                //iii
                else if (z[m - 1] === 0 && y[m - 2] === 0) {
                    //a
                    if (z[m - 2] !== g - 1) {
                        adjustment = "IV.2.iii.a";
                        x[m - 2] -= 1;
                        x[m - 1] = 1;
                        y[m - 2] = g - 1;
                        y[m - 1] -= 1;
                        z[m - 2] += 1;
                        z[m - 1] = 1;
                        x.splice(1, 0, 1);
                        return outputPalindromes();
                    }

                    //b
                    else if (z[m - 2] === g - 1 && y[m - 1] !== 1) {
                        adjustment = "IV.2.iii.b";
                        x[m - 2] -= 1;
                        x[m - 1] = 2;
                        y[m - 2] = g - 1;
                        y[m - 1] -= 2;
                        z[m - 2] = 0;
                        z[m - 1] = 3;
                        x.splice(1, 0, 1);
                        return outputPalindromes();
                    }

                    //c
                    else if (z[m - 2] === g - 1 && y[m - 1] === 1) {
                        adjustment = "IV.2.iii.c";
                        x[m - 2] -= 1;
                        x[m - 1] = 1;
                        y[m - 2] = g - 1;
                        y[m - 1] = g - 1;
                        z[m - 2] = 0;
                        z[m - 1] = 3;
                        x.splice(1, 0, 1);
                        return outputPalindromes();
                    }
                }
            }

            //3
            else if (x[m - 1] + c[m - 1] === 0 && y[m - 1] === g - 1) {
                adjustment = "IV.3";
                x[m - 1] = 1;
                y[m - 2] -= 1;
                y[m - 1] = g - 2;
                z[m - 2] += 1;
                z[m - 1] = 1;
                x.splice(1, 0, 1);
                return outputPalindromes();
            }

            //4
            else if (x[m - 1] + c[m - 1] === 2 && x[m - 1] === 0 && c[m - 1] === 2) {
                //i
                if (z[m - 1] !== g - 1) {
                    adjustment = "IV.4.i";
                    y[m - 1] -= 1;
                    z[m - 1] += 1;
                    x.splice(1, 0, 1);
                    return outputPalindromes();
                }

                //ii
                else if (z[m - 1] === g - 1 && z[m - 2] !== g - 1) {
                    //a
                    if (y[m - 2] !== 0) {
                        adjustment = "IV.4.ii.a";
                        x[m - 1] = 1;
                        y[m - 2] -= 1;
                        y[m - 1] -= 2;
                        z[m - 2] += 1;
                        z[m - 1] = 1;
                        x.splice(1, 0, 1);
                        return outputPalindromes();
                    }

                    //b
                    else if (y[m - 2] === 0) {
                        adjustment = "IV.4.ii.b";
                        x[m - 2] -= 1;
                        x[m - 1] = 1;
                        y[m - 2] = g - 1;
                        y[m - 2] -= 2;
                        z[m - 2] += 1;
                        z[m - 1] = 1;
                        x.splice(1, 0, 1);
                        return outputPalindromes();
                    }
                }

                //iii
                else if (z[m - 1] === g - 1 && z[m - 2] === g - 1) {
                    //a
                    if (![g - 1, g - 2].includes(y[m - 1])) {
                        adjustment = "IV.4.iii.a.(1)";
                        if (y[m - 2] !== g - 1) {
                            x[m - 2] -= 1;
                            x[m - 1] = g - 2;
                            y[m - 2] += 1;
                            y[m - 1] += 2;
                            z[m - 2] = g - 2;
                            z[m - 1] = g - 2;
                            x.splice(1, 0, 1);
                            return outputPalindromes();
                        }

                        else if (y[m - 2] === g - 1) {
                            adjustment = "IV.4.iii.a.(2)";
                            x[m - 1] = g - 2;
                            y[m - 2] = 0;
                            y[m - 1] += 2;
                            z[m - 2] = g - 2;
                            z[m - 1] = g - 2;
                            x.splice(1, 0, 1);
                            return outputPalindromes();
                        }
                    }

                    //b
                    else if ([g - 1, g - 2].includes(y[m - 1])) {
                        if (y[m - 2] >= 1) {
                            adjustment = "IV.4.iii.b.(1)";
                            x[m - 1] = 2;
                            y[m - 2] -= 1;
                            y[m - 1] -= 3;
                            z[m - 2] = 0;
                            z[m - 1] = 3;
                            x.splice(1, 0, 1);
                            return outputPalindromes();
                        }

                        else if (y[m - 2] === 0 && x[m - 2] >= 1) {
                            adjustment = "IV.4.iii.b.(2)";
                            x[m - 2] -= 1;
                            x[m - 1] = 2;
                            y[m - 2] = g - 1;
                            y[m - 1] -= 3;
                            z[m - 2] = 0;
                            z[m - 1] = 3;
                            x.splice(1, 0, 1);
                            return outputPalindromes();
                        }
                    }
                }
            }

            //5
            else if (x[m - 1] + c[m - 1] === 2 && x[m - 1] === 1 && c[m - 1] === 1) {
                //i
                if (z[m - 1] !== g - 1 && y[m - 1] !== 0) {
                    adjustment = "IV.5.i";
                    y[m - 1] -= 1;
                    z[m - 1] += 1;
                    x.splice(1, 0, 1);
                    return outputPalindromes();
                }

                //ii
                else if (z[m - 1] !== g - 1 && y[m - 1] === 0) {
                    adjustment = "IV.5.ii";
                    x[m - 1] = 0;
                    y[m - 1] = g - 1;
                    z[m - 1] += 1;
                    x.splice(1, 0, 1);
                    return outputPalindromes();
                }

                //iii
                else if (z[m - 1] === g - 1 && z[m - 2] !== 0) {
                    //a
                    if (y[m - 2] !== g - 1) {
                        adjustment = "IV.5.iii.a";
                        x[m - 1] = 0;
                        y[m - 2] += 1;
                        y[m - 1] += 1;
                        z[m - 2] -= 1;
                        z[m - 1] = g - 2;
                        x.splice(1, 0, 1);
                        return outputPalindromes();
                    }

                    //b
                    else if (y[m - 2] === g - 1 && ![0, 1].includes(y[m - 1])) {
                        adjustment = "IV.5.iii.b";
                        x[m - 1] = 2;
                        y[m - 2] = g - 2;
                        y[m - 1] -= 2;
                        z[m - 2] += 1;
                        z[m - 1] = 1;
                        x.splice(1, 0, 1);
                        return outputPalindromes();
                    }

                    //c
                    else if (y[m - 2] === g - 1 && y[m - 1] === 0) {
                        adjustment = "IV.5.iii.c";
                        y[m - 2] = g - 2;
                        y[m - 1] = g - 2;
                        z[m - 2] += 1;
                        z[m - 1] = 1;
                        x.splice(1, 0, 1);
                        return outputPalindromes();
                    }

                    //d
                    else if (y[m - 2] === g - 1 && y[m - 1] === 1) {
                        adjustment = "IV.5.iii.d";
                        y[m - 2] = g - 2;
                        y[m - 1] = g - 1;
                        z[m - 2] += 1;
                        z[m - 1] = 1;
                        x.splice(1, 0, 1);
                        return outputPalindromes();
                    }
                }

                //iv
                else if (z[m - 1] === g - 1 && z[m - 2] === 0 && y[m - 2] !== 0) {
                    //a
                    if (![0, 1].includes(y[m - 1])) {
                        adjustment = "IV.5.iv.a";
                        x[m - 1] = 2;
                        y[m - 2] -= 1;
                        y[m - 1] -= 2;
                        z[m - 2] = 1;
                        z[m - 1] = 1;
                        x.splice(1, 0, 1);
                        return outputPalindromes();
                    }

                    //b
                    else if (y[m - 1] === 0) {
                        adjustment = "IV.5.iv.b";
                        y[m - 2] -= 1;
                        y[m - 1] = g - 2;
                        z[m - 2] = 1;
                        z[m - 1] = 1;
                        x.splice(1, 0, 1);
                        return outputPalindromes();
                    }

                    //c
                    else if (y[m - 1] === 1) {
                        adjustment = "IV.5.iv.c";
                        y[m - 2] -= 1;
                        y[m - 1] = g - 1;
                        z[m - 2] = 1;
                        z[m - 1] = 1;
                        x.splice(1, 0, 1);
                        return outputPalindromes();
                    }
                }

                //v
                else if (z[m - 1] === g - 1 && z[m - 2] === 0 && y[m - 2] === 0) {
                    //a
                    if (![0, 1].includes(y[m - 1])) {
                        adjustment = "IV.5.v.a";
                        x[m - 2] -= 1;
                        x[m - 1] = 2;
                        y[m - 2] = g - 1;
                        y[m - 1] -= 2;
                        z[m - 2] = 1;
                        z[m - 1] = 1;
                        x.splice(1, 0, 1);
                        return outputPalindromes();
                    }

                    //b
                    else if (y[m - 1] === 0) {
                        adjustment = "IV.5.v.b";
                        x[m - 2] -= 1;
                        x[m - 1] = 1;
                        y[m - 2] = g - 1;
                        y[m - 1] = g - 2;
                        z[m - 2] = 1;
                        z[m - 1] = 1;
                        x.splice(1, 0, 1);
                        return outputPalindromes();
                    }

                    //c
                    else if (y[m - 1] === 1) {
                        adjustment = "IV.5.v.c";
                        x[m - 2] -= 1;
                        x[m - 1] = 1;
                        y[m - 2] = g - 1;
                        y[m - 1] = g - 1;
                        z[m - 2] = 1;
                        z[m - 1] = 1;
                        x.splice(1, 0, 1);
                        return outputPalindromes();
                    }
                }
            }

            //6
            else if (x[m - 1] + c[m - 1] === 3) {
                adjustment = "IV.6";
                y[m - 1] -= 1;
                z[m - 1] = 0;
                x.splice(1, 0, 1);
                return outputPalindromes();
            }
        }

        //V
        else if (isSpecial) {
            algorithm = "V";

            let s = g ** m + g ** (m - 1);
            let n_ = n - s;
            let d_ = getDigits(n_);

            if (d_[m - 1] === 0 || d_[m] === 0) {
                n_ = n - 2 * s;
                d_ = getDigits(n_);
            }


            let l_ = d_.length;
            let t_ = getType(d_, l_, g);
            let type_ = t_.type;
            let p1_ = t_.p1;
            let p2_, p3_;
            let ps_;

            //i
            if (p1_.length === 2 * m) {
                //II
                if (type_[0] === "A") {
                    ps_ = getPalindromes(n_, "II");
                }
                //IV
                else if (type_[0] === "B") {
                    ps_ = getPalindromes(n_, "IV");
                }
            }

            //ii
            else if (p1_.length === 2 * m - 1) {
                ps_ = getPalindromes(n_, "IV");
            }

            p1_ = ps_.palindromes[0];
            p2_ = ps_.palindromes[1];
            p3_ = ps_.palindromes[2];

            let f = k => n === (p1_ + k * s) + p2_ + p3_;

            if (f(1)) {
                p1 = getDigits(p1_ + s);
                p2 = getDigits(p2_);
                p3 = getDigits(p3_);
                return outputPalindromes(true);
            }

            else if (f(2)) {
                p1 = getDigits(p1_ + 2 * s);
                p2 = getDigits(p2_);
                p3 = getDigits(p3_);
                return outputPalindromes(true);
            }
        }
    }

    //for integers with less than 7 digits
    else {
        type = "Small number"
        switch (l) {
            //lemma 4.2
            case 2:
                if (n === g) {
                    algorithm = "Lemma 4.2.(0)";
                    p1 = [9];
                    p2 = [1];
                    p3 = [0];
                    return outputPalindromes(true);
                }

                else if (d[1] <= d[0]) {
                    algorithm = "Lemma 4.2.(1)";
                    p1 = [d[1], d[1]];
                    p2 = [d[0] - d[1]];
                    p3 = [0];
                    return outputPalindromes(true);
                }

                else if (d[1] > d[0] + 1) {
                    algorithm = "Lemma 4.2.(2)";
                    p1 = [d[1] - 1, d[1] - 1];
                    p2 = [g + d[0] - d[1] + 1];
                    p3 = [0];
                    return outputPalindromes(true);
                }

                else if (d[1] === d[0] + 1 && d[0] >= 1) {
                    algorithm = "Lemma 4.2.(3)";
                    p1 = [d[0], d[0]];
                    p2 = [g - 1];
                    p3 = [1];
                    return outputPalindromes(true);
                }
                break;

            //lemma 4.3
            case 3:
                if (d[2] <= d[0]) {
                    algorithm = "Lemma 4.3.(1)";
                    p1 = [d[2], d[1], d[2]];
                    p2 = [d[0] - d[2]];
                    p3 = [0];
                    return outputPalindromes(true);
                }

                else if (d[2] >= d[0] + 1 && d[1] !== 0) {
                    algorithm = "Lemma 4.3.(2)";
                    p1 = [d[2], d[1] - 1, d[2]];
                    p2 = [g + d[0] - d[2]];
                    p3 = [0];
                    return outputPalindromes(true);
                }

                else if (d[2] >= d[0] + 1 && d[1] === 0 && D(d[2] - d[0] - 1) !== 0) {
                    algorithm = "Lemma 4.3.(3)";
                    p1 = [d[2] - 1, g - 1, d[2] - 1];
                    p2 = [g + d[0] - d[2] + 1];
                    p3 = [0];
                    return outputPalindromes(true);
                }

                else if (d[2] >= d[0] + 1 && d[1] === 0 && D(d[2] - d[0] - 1) === 0) {
                    if (d[2] >= 3) {
                        algorithm = "Lemma 4.3.(4).a";
                        p1 = [d[2] - 2, g - 1, d[2] - 2];
                        p2 = [1, 1, 1];
                        p3 = [0];
                        return outputPalindromes(true);
                    }

                    else if (d[2] === 2) {
                        algorithm = "Lemma 4.3.(4).b";
                        p1 = [1, 0, 1];
                        p2 = [g - 1, g - 1];
                        p3 = [1];
                        return outputPalindromes(true);
                    }

                    else if (d[2] === 1) {
                        algorithm = "Lemma 4.3.(4).c";
                        p1 = [g - 1, g - 1];
                        p2 = [1];
                        p3 = [0];
                        return outputPalindromes(true);
                    }
                }
                break;

            //lemma 4.4
            case 4:
                let q = parseInt(`${d[3]}00${d[3]}`);
                let a = n - q;
                let dd = D(a);

                //i
                if (n >= q && a !== 201 && (a !== parseInt(`${dd + 1}${dd}`) || dd === 0 || dd > g - 2)) {
                    algorithm = "Lemma 4.4.i";
                    let t_ = getPalindromes(n - q);
                    p1 = getDigits(q);
                    p2 = getDigits(t_.palindromes[0]);
                    p3 = getDigits(t_.palindromes[1]);
                    return outputPalindromes(true);
                }

                //ii
                else if (n === q + 201) {

                    //(1)
                    if (![1, g - 1].includes(d[3])) {
                        algorithm = "Lemma 4.4.ii.(1)";
                        p1 = [d[3] - 1, g - 1, g - 1, d[3] - 1];
                        p2 = [2, 1, 2];
                        p3 = [0];
                        return outputPalindromes(true);
                    }

                    //(2)
                    else if (d[3] === 1) {
                        algorithm = "Lemma 4.4.ii.(2)";
                        p1 = [1, 1, 1, 1];
                        p2 = [g - 2, g - 2];
                        p3 = [3];
                        return outputPalindromes(true);
                    }

                    //(3)
                    else if (d[3] === g - 1) {
                        algorithm = "Lemma 4.4.ii.(3)";
                        p1 = [g - 1, 1, 1, g - 1];
                        p2 = [g - 2, g - 2];
                        p3 = [3];
                        return outputPalindromes(true);
                    }
                }

                //iii
                else if (n === q + parseInt(`${dd + 1}${dd}`) && 1 <= dd && dd <= g - 2) {
                    //a
                    if (d[3] + dd === d[0]) {
                        //(1)
                        if (d[3] !== 1) {
                            algorithm = "Lemma 4.4.iii.a.(1)";
                            p1 = [d[3] - 1, g - 2, g - 2, d[3] - 1];
                            p2 = [1, 3, 1];
                            p3 = [dd, dd];
                            return outputPalindromes(true);
                        }

                        //(2)
                        else if (d[3] === 1) {
                            algorithm = "Lemma 4.4.iii.a.(2)";
                            p1 = [g - 1, g - 1, g - 1];
                            p2 = [dd + 1, dd + 1];
                            p3 = [1];
                            return outputPalindromes(true);
                        }
                    }

                    //b
                    else if (d[3] + dd === g + d[0] && 0 <= d[0] && d[0] <= g - 1) {
                        algorithm = "Lemma 4.4.iii.b";
                        p1 = [d[3] - 1, g - 2, g - 2, d[3] - 1];
                        p2 = [1, 3, 1];
                        p3 = [dd, dd];
                        return outputPalindromes(true);
                    }
                }

                //iv
                else if (n === parseInt(`${d[3]}00${d[0]}`) && d[0] <= d[3] - 1 && d[3] !== 1) {
                    algorithm = "Lemma 4.4.iv";
                    p1 = [d[3] - 1, g - 1, g - 1, d[3] - 1];
                    p2 = [g + d[0] - d[3]];
                    p3 = [1];
                    return outputPalindromes(true);
                }

                //v
                else if (n === 1000) {
                    algorithm = "Lemma 4.4.v";
                    p1 = [g - 1, g - 1, g - 1];
                    p2 = [1];
                    p3 = [0];
                    return outputPalindromes(true);
                }
                break;

            //lemma 4.5
            case 5:
                if (d[4] !== 1) {
                    algorithm = "Lemma 4.5 - I";
                    let t_ = getPalindromes(n, "I");
                    p1 = getDigits(t_.palindromes[0]);
                    p2 = getDigits(t_.palindromes[1]);
                    p3 = getDigits(t_.palindromes[2]);
                    type = t_.type;
                    isSpecial = t_.isSpecial;
                    adjustment = t_.adjustment;
                    return outputPalindromes(true);
                }

                else if (d[4] === 1) {
                    let q1 = parseInt(`1${d[3]}0${d[3]}1`);
                    let a1 = n - q1;
                    let q1_2 = parseInt(`1${d[3]}0${d[3]}0`);
                    let q1_3 = parseInt(`1${d[3] - 1}${g - 1}${d[3] - 1}1`);
                    let a1_2 = n - q1_3;
                    let dd1 = D(a1);
                    let dd1_2 = D(a1_2);

                    //i
                    if (n >= q1 && a1 !== 201 && (a1 !== parseInt(`${dd1 + 1}${dd1}`) || dd1 === 0 || dd1 > g - 2)) {
                        algorithm = "Lemma 4.5.i";
                        let t_ = getPalindromes(a1);
                        p1 = getDigits(q1);
                        p2 = getDigits(t_.palindromes[0]);
                        p3 = getDigits(t_.palindromes[1]);
                        return outputPalindromes(true);
                    }

                    //ii
                    else if (n === q1 + 201) {
                        algorithm = "Lemma 4.5.ii";
                        p1 = [1, d[3], 1, d[3], 1];
                        p2 = [1, 0, 1];
                        p3 = [0];
                        return outputPalindromes(true);
                    }

                    //iii
                    else if (n === q1 + parseInt(`${dd1 + 1}${dd1}`) && 1 <= dd1 && dd1 <= g - 2 && d[3] !== 0) {
                        //a
                        if (dd1 + 1 + d[3] <= g - 1) {
                            algorithm = "Lemma 4.5.iii.a";
                            p1 = [1, d[3] - 1, 1, d[3] - 1, 1];
                            p2 = [g - 1, dd1 + 1, g - 1];
                            p3 = [dd1 + 1];
                            return outputPalindromes(true);
                        }
                        //b
                        else if (d[3] + 1 + dd1 === g + d[1] && 0 <= d[1] && d[1] <= g - 1) {
                            algorithm = "Lemma 4.5.iii.b";
                            p1 = [1, d[3] - 1, 1, d[3] - 1, 1];
                            p2 = [g - 1, dd1 + 1, g - 1];
                            p3 = [dd1 + 1];
                            return outputPalindromes(true);
                        }
                    }

                    //iv
                    else if (n === q1 + parseInt(`${dd1 + 1}${dd1}`) && 1 <= dd1 && dd1 <= g - 2 && d[3] === 0) {
                        algorithm = "Lemma 4.5.iv";
                        p1 = [g - 1, g - 1, g - 1, g - 1];
                        p2 = [dd1 + 1, dd1 + 1];
                        p3 = [1];
                        return outputPalindromes(true);
                    }

                    //v
                    else if (n <= q1_2 && d[3] === 0) {
                        algorithm = "Lemma 4.5.v";
                        p1 = [g - 1, g - 1, g - 1, g - 1];
                        p2 = [1];
                        p3 = [0];
                        return outputPalindromes(true);
                    }

                    //vi
                    else if (n <= q1_2 && d[3] !== 0 && a1_2 !== 201 && (a1_2 !== parseInt(`${dd1_2 + 1}${dd1_2}`) || dd1_2 === 0 || dd1_2 > g - 2)) {
                        algorithm = "Lemma 4.5.vi";
                        let t_ = getPalindromes(a1_2);
                        p1 = getDigits(q1_3);
                        p2 = getDigits(t_.palindromes[0]);
                        p3 = getDigits(t_.palindromes[1]);
                        return outputPalindromes(true);
                    }

                    //vii
                    else {
                        algorithm = "Lemma 4.5.vii";
                        p1 = [1, d[3] - 1, g - 2, d[3] - 1, 1];
                        p2 = [1, dd1_2 + 1, 1];
                        p3 = [dd1_2 - 1];
                        return outputPalindromes(true);
                    }
                }
                break;

            //lemma 4.6
            case 6:
                if (d[5] !== 1) {
                    algorithm = "Lemma 4.6 - II";
                    let t_ = getPalindromes(n, "II");
                    p1 = getDigits(t_.palindromes[0]);
                    p2 = getDigits(t_.palindromes[1]);
                    p3 = getDigits(t_.palindromes[2]);
                    type = t_.type;
                    isSpecial = t_.isSpecial;
                    adjustment = t_.adjustment;
                    return outputPalindromes(true);
                }

                else if (d[5] === 1) {
                    //i
                    if (D(d[0] - d[4] + 1) !== 0 && D(d[0] - d[4] + 2) !== 0) {
                        algorithm = "Lemma 4.6.i";
                        [x[1], y[1]] = getAddends(g + d[4] - 1, 1, g - 1);
                        z[1] = D(d[0] - d[4] + 1);
                        c[1] = Math.floor((x[1] + y[1] + z[1]) / g);
                        [x[2], y[2]] = getAddends(g + d[3] - 1, 0, g - 1);
                        z[2] = D(d[1] - x[2] - y[2] - c[1]);
                        c[2] = Math.floor((x[2] + y[2] + z[2] + c[1] - d[1]) / g);
                        [x[3], y[3]] = getAddends(g + d[2] - c[2] - z[1], 0, g - 1);

                        p1 = [x[1], x[2], x[3], x[2], x[1]];
                        p2 = [y[1], y[2], y[3], y[2], y[1]];
                        p3 = [z[1], z[2], z[1]];

                        return outputPalindromes(true);
                    }

                    //ii
                    else if (D(d[0] - d[4] + 2) === 0 && d[2] !== 0) {
                        algorithm = "Lemma 4.6.ii";
                        [x[1], y[1]] = getAddends(g + d[4] - 1, 1, g - 1);
                        z[1] = g - 1;
                        c[1] = Math.floor((2 * g + d[4] - 2 - d[0]) / g);
                        [x[2], y[2]] = getAddends(g + d[3] - 1, 0, g - 1);
                        z[2] = D(d[1] - x[2] - y[2] - c[1]);
                        c[2] = Math.floor((x[2] + y[2] + z[2] + c[1] - d[1]) / g);
                        [x[3], y[3]] = getAddends(1 + d[2] - c[2], 0, g - 1);

                        p1 = [x[1], x[2], x[3], x[2], x[1]];
                        p2 = [y[1], y[2], y[3], y[2], y[1]];
                        p3 = [z[1], z[2], z[1]];

                        return outputPalindromes(true);
                    }

                    //iii
                    else if (D(d[0] - d[4] + 2) === 0 && d[2] === 0) {
                        //a
                        if (d[4] === 0) {
                            algorithm = "Lemma 4.6.iii.a";
                            x[1] = g - 2;
                            y[1] = 1;
                            z[1] = g - 1;
                            c[1] = Math.floor((x[1] + y[1] + z[1]) / g);
                            [x[2], y[2]] = getAddends(d[3], 0, g - 1);
                            z[2] = D(d[1] - x[2] - y[2] - c[1]);
                            c[2] = Math.floor((x[2] + y[2] + z[2] + c[1] - d[1]) / g);
                            [x[3], y[3]] = getAddends(g - c[2] - z[2], 0, g - 1);

                            p1 = [x[1], x[2], x[3], x[2], x[1]];
                            p2 = [y[1], y[2], y[3], y[2], y[1]];
                            p3 = [z[1], z[2], z[2], z[1]];

                            return outputPalindromes(true);
                        }

                        //b
                        else if (d[4] === 1) {
                            algorithm = "Lemma 4.6.iii.b";
                            x[1] = g - 1;
                            y[1] = 1;
                            z[1] = g - 1;
                            c[1] = Math.floor((x[1] + y[1] + z[1]) / g);
                            [x[2], y[2]] = getAddends(d[3], 0, g - 1);
                            z[2] = D(d[1] - x[2] - y[2] - c[1]);
                            c[2] = Math.floor((x[2] + y[2] + z[2] + c[1] - d[1]) / g);
                            [x[3], y[3]] = getAddends(g - c[2] - z[2], 0, g - 1);

                            p1 = [x[1], x[2], x[3], x[2], x[1]];
                            p2 = [y[1], y[2], y[3], y[2], y[1]];
                            p3 = [z[1], z[2], z[2], z[1]];

                            return outputPalindromes(true);
                        }

                        //c
                        else if (d[4] === 2) {
                            algorithm = "Lemma 4.6.iii.c";
                            x[1] = g - 1;
                            y[1] = 2;
                            z[1] = g - 1;
                            c[1] = Math.floor((x[1] + y[1] + z[1]) / g);
                            [x[2], y[2]] = getAddends(d[3], 0, g - 1);
                            z[2] = D(d[1] - x[2] - y[2] - c[1]);
                            c[2] = Math.floor((x[2] + y[2] + z[2] + c[1] - d[1]) / g);

                            if (c[2] !== 2) {
                                [x[3], y[3]] = getAddends(g - c[2] - z[2], 0, g - 1);

                                p1 = [x[1], x[2], x[3], x[2], x[1]];
                                p2 = [y[1], y[2], y[3], y[2], y[1]];
                                p3 = [z[1], z[2], z[2], z[1]];

                                return outputPalindromes(true);
                            }

                            else {
                                p1 = [1, 2, g - 2, g - 2, 2, 1];
                                p2 = [1, g - 3, 1];
                                p3 = [g - 2];
                                return outputPalindromes(true);
                            }
                        }

                        //d
                        else if (d[4] >= 3) {
                            algorithm = "Lemma 4.6.iii.d";
                            c[4] = Math.floor((D(d[3] - 1) + 1 - d[3]) / g);
                            c[1] = 1;
                            z[1] = D(d[1] - d[3] - 1 + c[4])
                            c[2] = Math.floor((2 - c[4] + D(d[3] - 1) + z[1] - d[1]) / g);

                            p1 = [1, 1 - c[4], 0, 0, 1 - c[4], 1];
                            p2 = [d[4] - 1, D(d[3] - 1), 2 - c[2], D(d[3] - 1), d[4] - 1];
                            p3 = [g - 2, z[1], g - 2];
                            return outputPalindromes(true);
                        }
                    }

                    //iv
                    else if (D(d[0] - d[4] + 1) === 0 && d[3] !== 0) {
                        //a
                        if (d[4] !== g - 1) {
                            algorithm = "Lemma 4.6.iv.a";
                            [x[1], y[1]] = getAddends(g + d[4], 1, g - 1);
                            z[1] = g - 1;
                            c[1] = Math.floor((x[1] + y[1] + z[1]) / g);
                            [x[2], y[2]] = getAddends(d[3] - 1, 0, g - 1);
                            z[2] = D(d[1] - x[2] - y[2] - c[1]);
                            c[2] = Math.floor((x[2] + y[2] + z[2] + c[1] - d[1]) / g);
                            [x[3], y[3]] = getAddends(1 + d[2] - c[2], 0, g - 1);

                            p1 = [x[1], x[2], x[3], x[2], x[1]];
                            p2 = [y[1], y[2], y[3], y[2], y[1]];
                            p3 = [z[1], z[2], z[1]];

                            return outputPalindromes(true);
                        }

                        //b
                        else if (d[4] === g - 1) {
                            algorithm = "Lemma 4.6.iv.b";
                            let u = 0;
                            let [x, y] = getAddends2(d[3], 0, g - 1);
                            c[1] = Math.floor((3 + y + D(d[1] - 3 - y) - d[1]) / g);
                            c[2] = Math.floor((x + D(d[2] - x - 1 - c[1] + u) + c[1] + 1 - d[2]) / g);
                            if (![0, 1].includes(c[2])) {
                                u = 1;
                                c[2] = 1;
                            }
                            c[3] = Math.floor((x + (y - c[2]) + c[2] - d[3]) / g);

                            p1 = [1, 3 - c[3], x - u, x - u, 3 - c[3], 1];
                            p2 = [g - 4, y - c[2] + u, D(d[2] - x - 1 - c[1] + u), y - c[2] + u, g - 4];
                            p3 = [1, D(d[1] - 3 - y) + (c[2] - u) + c[3], 1];
                            return outputPalindromes(true);
                        }
                    }

                    //v
                    else if (D(d[0] - d[4] + 1) === 0 && d[3] === 0) {
                        //a
                        if (d[4] === 0) {
                            algorithm = "Lemma 4.6.v.a";
                            if (d[2] !== 0 || (d[2] === 0 && ![0, g - 1].includes(d[1]))) {
                                let t_ = getPalindromes(n - 100001);
                                p1 = getDigits(100001);
                                p2 = getDigits(t_.palindromes[0]);
                                p3 = getDigits(t_.palindromes[1]);
                                return outputPalindromes(true);
                            }

                            else if (d[2] === 0 && d[1] === 0) {
                                p1 = [1, 0, 0, 0, 0, 1];
                                p2 = [g - 2];
                                p3 = [0];
                                return outputPalindromes(true);
                            }

                            else if (d[2] === 0 && d[1] === g - 1) {
                                p1 = [g - 1, 0, 1, 0, g - 1];
                                p2 = [g - 1, g - 2, g - 2, g - 1];
                                p3 = [1, 0, 1];
                                return outputPalindromes(true);
                            }
                        }

                        //b
                        else if (d[4] === 1) {
                            algorithm = "Lemma 4.6.v.b";
                            if (d[2] >= 2 || (d[2] === 1 && ![0, 1].includes(d[1]))) {
                                let t_ = getPalindromes(n - 110011);
                                p1 = getDigits(110011);
                                p2 = getDigits(t_.palindromes[0]);
                                p3 = getDigits(t_.palindromes[1]);
                                return outputPalindromes(true);
                            }

                            else if (d[2] === 1 && d[1] === 0) {
                                p1 = [1, 0, g - 1, g - 1, 0, 1];
                                p2 = [1, g - 1, 1];
                                p3 = [g - 2];
                                return outputPalindromes(true);
                            }

                            else if (d[2] === 1 && d[1] === 1) {
                                p1 = [1, 1, 0, 0, 1, 1];
                                p2 = [g - 1, g - 1];
                                p3 = [0];
                                return outputPalindromes(true);
                            }

                            else if (d[2] === 0 && d[1] >= 2) {
                                p1 = [1, 1, 0, 0, 1, 1];
                                p2 = [d[1] - 2, d[1] - 2];
                                p3 = [g - d[1] + 1];
                                return outputPalindromes(true);
                            }

                            else if (d[2] === 0 && d[1] === 1) {
                                p1 = [1, 0, 0, 0, 0, 1];
                                p2 = [1, 0, 0, 0, 1];
                                p3 = [g - 2];
                                return outputPalindromes(true);
                            }

                            else if (d[2] === 0 && d[1] === 0) {
                                p1 = [1, 0, 0, 0, 0, 1];
                                p2 = [g - 1, g - 1, g - 1, g - 1];
                                p3 = [0];
                                return outputPalindromes(true);
                            }
                        }

                        //c
                        else if (d[4] === 2) {
                            algorithm = "Lemma 4.6.v.c";
                            if (d[2] >= 2 || (d[2] === 1 && ![0, 1].includes(d[1]))) {
                                let t_ = getPalindromes(n - 120021);
                                p1 = getDigits(120021);
                                p2 = getDigits(t_.palindromes[0]);
                                p3 = getDigits(t_.palindromes[1]);
                                return outputPalindromes(true);
                            }

                            else if (d[2] === 1 && d[1] === 0) {
                                p1 = [1, 1, g - 1, g - 1, 1, 1];
                                p2 = [1, g - 2, 1];
                                p3 = [g - 1];
                                return outputPalindromes(true);
                            }

                            else if (d[2] === 1 && d[1] === 1) {
                                p1 = [1, 1, g - 1, g - 1, 1, 1];
                                p2 = [1, g - 1, 1];
                                p3 = [g - 1];
                                return outputPalindromes(true);
                            }

                            else if (d[2] === 0 && d[1] >= 3) {
                                p1 = [1, 2, 0, 0, 2, 1];
                                p2 = [d[1] - 3, d[1] - 3];
                                p3 = [g - d[1] + 3];
                                return outputPalindromes(true);
                            }

                            else if (d[2] === 0 && d[1] === 2) {
                                p1 = [1, 1, g - 1, g - 1, 1, 1];
                                p2 = [1, 0, 1];
                                p3 = [g - 1];
                                return outputPalindromes(true);
                            }

                            else if (d[2] === 0 && d[1] === 1) {
                                p1 = [1, 0, 0, 0, 0, 1];
                                p2 = [2, 0, 0, 0, 2];
                                p3 = [g - 2];
                                return outputPalindromes(true);
                            }

                            else if (d[2] === 0 && d[1] === 0) {
                                p1 = [1, 1, g - 1, g - 1, 1, 1];
                                p2 = [g - 2, g - 2];
                                p3 = [2];
                                return outputPalindromes(true);
                            }
                        }

                        //d
                        else if (d[4] === 3) {
                            algorithm = "Lemma 4.6.v.d";
                            let y = D(d[1] - 1 - 1) === 0 ? 3 : D(d[1] - 1 - 1) === g - 1 ? 2 : 1;
                            c[1] = Math.floor((2 + y + D(d[1] - 1 - y) - d[1]) / g);
                            c[2] = Math.floor((g - y - 1 + D(d[2] + y + 2) + g - 1 - d[2]) / g);

                            console.log(y)
                            console.log(c)

                            p1 = [1, 0, g - y - 1 - c[1], g - y - 1 - c[1], 0, 1];
                            p2 = [2, y - c[2] + 1 + c[1], D(d[2] + y + 2), y - c[2] + 1 + c[1], 2];
                            p3 = [g - 1, D(d[1] - 1 - y) + (c[2] - 1) - c[1], g - 1];
                            return outputPalindromes(true);
                        }

                        //e
                        else if (d[4] >= 4) {
                            algorithm = "Lemma 4.6.v.e";
                            let y = D(d[1] - 1 - 1) === 0 ? 3 : D(d[1] - 1 - 1) === g - 1 ? 2 : 1;
                            c[1] = Math.floor((1 + y + D(d[1] - 1 - y) - d[1]) / g);
                            c[2] = Math.floor((g - y + 1 + D(d[2] + y - 1) - d[2]) / g);

                            p1 = [1, 2, g - y - c[1], g - y - c[1], 2, 1];
                            p2 = [d[4] - 3, y - c[2] + c[1], D(d[2] + y - 1), y - c[2] + c[1], d[4] - 3];
                            p3 = [1, D(d[1] - 2 - y) + c[2] - c[1], 1];
                            return outputPalindromes(true);
                        }
                    }
                }
                break;


            default:
                break;
        }
    }



    function D(x) {
        let result = x % g;
        if (result < 0) result += g
        return result;
    }
    function getAddends2(k, min, max) {
        let addends;
        for (let a = 0; a < max + 1; a++) {
            for (let b = 1; b < 4; b++) {
                if (D(a + b) === k && ![g - 2, g - 1].includes(D(d[1] - 3 - b))) {
                    addends = [a, b];
                    break;
                }
            }
        }
        return addends;
    }
    function getAddends(k, min, max) {
        let addends;
        for (let a = min; a < max + 1; a++) {
            for (let b = min; b < max + 1; b++) {
                if (a + b === k) {
                    addends = [a, b];
                    break;
                }
            }
        }
        return addends;
    }
    function getDigits(b) {
        return b.toString().split("").map(v => parseInt(v)).reverse();
    }
    function emptyArray(length) {
        return Array(length).fill(null);
    }
    function isPalindrome(a) {
        let isP = true;
        for (let i = 1; i <= m; i++) {
            if (d[l - i] !== d[i - 1]) {
                isP = false;
                break;
            }
        }
        return isP;
    }
    function outputPalindromes(skip) {
        if (!skip) {
            x.shift();
            y.shift();
            z.shift();

            x.forEach((v, i) => {
                p1[i] = v;
                p1[Math.abs(i - p1.length + 1)] = v;
            });
            y.forEach((v, i) => {
                p2[i] = v;
                p2[Math.abs(i - p2.length + 1)] = v;
            });
            z.forEach((v, i) => {
                p3[i] = v;
                p3[Math.abs(i - p3.length + 1)] = v;
            });
        }

        let palindromes = [p1, p2, p3].map(v => parseInt(v.reverse().map(a => a.toString()).join("")));
        return {
            n,
            palindromes,
            sum: palindromes.reduce((p, v) => p + v),
            l,
            isSpecial,
            type,
            algorithm,
            adjustment
        };
    }
    function getType(d, l, g) {
        let type_ = "";
        let p1_, p2_, p3_;
        if (![0, 1, 2].includes(d[l - 2]) && D(d[0] - d[l - 1] - d[l - 2] + 1) !== 0) {
            type_ = "A1";
            let z1 = D(d[0] - d[l - 1] - d[l - 2] + 1);
            p1_ = [d[l - 1], ...emptyArray(l - 2), d[l - 1]];
            p2_ = [d[l - 2] - 1, ...emptyArray(l - 3), d[l - 2] - 1];
            p3_ = [z1, ...emptyArray(l - 4), z1];
        }

        else if (![0, 1, 2].includes(d[l - 2]) && D(d[0] - d[l - 1] - d[l - 2] + 1) === 0) {
            type_ = "A2";
            p1_ = [d[l - 1], ...emptyArray(l - 2), d[l - 1]];
            p2_ = [d[l - 2] - 2, ...emptyArray(l - 3), d[l - 2] - 2];
            p3_ = [1, ...emptyArray(l - 4), 1];
        }

        else if ([0, 1, 2].includes(d[l - 2]) && d[l - 1] !== 1 && D(d[0] - d[l - 1] + 2) !== 0) {
            type_ = "A3";
            let z1 = D(d[0] - d[l - 1] + 2);
            p1_ = [d[l - 1] - 1, ...emptyArray(l - 2), d[l - 1] - 1];
            p2_ = [g - 1, ...emptyArray(l - 3), g - 1];
            p3_ = [z1, ...emptyArray(l - 4), z1];
        }

        else if ([0, 1, 2].includes(d[l - 2]) && d[l - 1] !== 1 && D(d[0] - d[l - 1] + 2) === 0) {
            type_ = "A4";
            p1_ = [d[l - 1] - 1, ...emptyArray(l - 2), d[l - 1] - 1];
            p2_ = [g - 2, ...emptyArray(l - 3), g - 2];
            p3_ = [1, ...emptyArray(l - 4), 1];
        }

        else if (d[l - 1] === 1 && d[l - 2] === 0 && d[l - 3] <= 3 && D(d[0] - d[l - 3]) !== 0) {
            type_ = "A5";
            let z1 = D(d[0] - d[l - 3]);
            p1_ = [g - 1, ...emptyArray(l - 3), g - 1];
            p2_ = [d[l - 3] + 1, ...emptyArray(l - 4), d[l - 3] + 1];
            p3_ = [z1, ...emptyArray(l - 5), z1];
        }

        else if (d[l - 1] === 1 && d[l - 2] === 0 && d[l - 3] <= 2 && D(d[0] - d[l - 3]) === 0) {
            type_ = "A6";
            p1_ = [g - 1, ...emptyArray(l - 3), g - 1];
            p2_ = [d[l - 3] + 2, ...emptyArray(l - 4), d[l - 3] + 2];
            p3_ = [g - 1, ...emptyArray(l - 5), g - 1];
        }

        else if (d[l - 1] === 1 && d[l - 2] <= 2 && d[l - 3] >= 4 && D(d[0] - d[l - 3]) !== 0) {
            type_ = "B1";
            let z1 = D(d[0] - d[l - 3]);
            p1_ = [1, d[l - 2], ...emptyArray(l - 4), d[l - 2], 1];
            p2_ = [d[l - 3] - 1, ...emptyArray(l - 4), d[l - 3] - 1];
            p3_ = [z1, ...emptyArray(l - 5), z1];
        }

        else if (d[l - 1] === 1 && d[l - 2] <= 2 && d[l - 3] >= 3 && D(d[0] - d[l - 3]) === 0) {
            type_ = "B2";
            p1_ = [1, d[l - 2], ...emptyArray(l - 4), d[l - 2], 1];
            p2_ = [d[l - 3] - 2, ...emptyArray(l - 4), d[l - 3] - 2];
            p3_ = [1, ...emptyArray(l - 5), 1];
        }

        else if (d[l - 1] === 1 && [1, 2].includes(d[l - 2]) && [0, 1].includes(d[l - 3]) && d[0] === 0) {
            type_ = "B3";
            p1_ = [1, d[l - 2] - 1, ...emptyArray(l - 4), d[l - 2] - 1, 1];
            p2_ = [g - 2, ...emptyArray(l - 4), g - 2];
            p3_ = [1, ...emptyArray(l - 5), 1];
        }

        else if (d[l - 1] === 1 && [1, 2].includes(d[l - 2]) && [2, 3].includes(d[l - 3]) && d[0] === 0) {
            type_ = "B4";
            p1_ = [1, d[l - 2], ...emptyArray(l - 4), d[l - 2], 1];
            p2_ = [1, ...emptyArray(l - 4), 1];
            p3_ = [g - 2, ...emptyArray(l - 5), g - 2];
        }

        else if (d[l - 1] === 1 && [1, 2].includes(d[l - 2]) && [0, 1, 2].includes(d[l - 3]) && d[0] !== 0) {
            type_ = "B5";
            let z1 = d[0];
            p1_ = [1, d[l - 2] - 1, ...emptyArray(l - 4), d[l - 2] - 1, 1];
            p2_ = [g - 1, ...emptyArray(l - 4), g - 1];
            p3_ = [z1, ...emptyArray(l - 5), z1];
        }

        else if (d[l - 1] === 1 && [1, 2].includes(d[l - 2]) && d[l - 3] === 3 && D(d[0] - 3) !== 0) {
            type_ = "B6";
            let z1 = D(d[0] - 3);
            p1_ = [1, d[l - 2], ...emptyArray(l - 4), d[l - 2], 1];
            p2_ = [2, ...emptyArray(l - 4), 2];
            p3_ = [z1, ...emptyArray(l - 5), z1];
        }

        else if (d[l - 1] === 1 && [1, 2].includes(d[l - 2]) && d[l - 3] === 3 && d[0] === 3) {
            type_ = "B7";
            p1_ = [1, d[l - 2], ...emptyArray(l - 4), d[l - 2], 1];
            p2_ = [1, ...emptyArray(l - 4), 1];
            p3_ = [1, ...emptyArray(l - 5), 1];
        }
        return {
            type: type_,
            p1: p1_,
            p2: p2_,
            p3: p3_,
        };
    }
}