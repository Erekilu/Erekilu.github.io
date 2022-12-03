var handSize, deckSize, combos;

function getHandSize() {
    return handSize;
}

function getDeckSize() {
    return deckSize;
}

function getMiscMax() {
    let sum = 0;
    for (var i = 0; i < combos.length; i++) {
        sum += combos[i].cardMinNum;
    }
    return handSize - sum;
}

function getMiscAmt() {
    let sum = 0;
    for (var i = 0; i < combos.length; i++) {
        sum += combos[i].cardNum;
    }

    return deckSize - sum;
}

function verify(combosArray) {
    if (handSize <= 0 || deckSize < handSize) {
        return "手牌数量或牌库数量异常，请重新输入！"
    }

    var combosCardSum = 0, combosMinSum = 0, combosMaxSum = 0;
    for (var i = 0; i < combosArray.length; i++) {
        let {cardNum, cardMinNum, cardMaxNum, cardName} = combosArray[i];
        combosCardSum += cardNum, combosMinSum += cardMinNum, combosMaxSum += cardMaxNum;
        if (cardMinNum < 0 || cardMinNum > cardMaxNum || cardMaxNum > cardNum) {
            return "卡牌/组合名为“" + cardName + "”所在行数量异常，请重新输入！"
        }

        if (combosCardSum > deckSize) {
            return "勾选的卡牌/组合中的卡牌数量之和超过牌库总量，请重新输入！"
        }

        if (combosMinSum > handSize) {
            return "勾选的卡牌/组合中的最小抽牌数之和超过手牌总量，请重新输入！"
        }
    }

    return 0;
}

function calculate(deckCount, holdingCount, chooseCombos) {
    deckSize = deckCount, handSize = holdingCount, combos = chooseCombos;

    // 规则校验
    let verifyResult = verify(chooseCombos);
    if (verifyResult != 0) {
        return verifyResult;
    };

    let objects = [];
    for (var i = 0; i < combos.length; i++) {
        var obj = {
            amt: chooseCombos[i].cardNum,
            min: chooseCombos[i].cardMinNum,
            max: chooseCombos[i].cardMaxNum,
            name: chooseCombos[i].cardName
        };

        objects.push(obj);
    }

    // console.log(getHandSize(), getDeckSize(), getMiscMax(), getMiscAmt());

    let chance = 0;
    if (getMiscMax() === 0 && getDeckSize() == getHandSize()) {
        chance = 100;
    } else {
        let recursive = recursiveCalculate([], 0, objects);
        chance = (recursive / choose(getDeckSize(), getHandSize())) * 100;
        // console.log(recursive);
    }

    return chance;
}

function recursiveCalculate(currentHand, currentHandSize, objects) {
    if (objects.length === 0 || currentHandSize >= getHandSize()) {
        if (currentHandSize == getHandSize()) {
            // console.log("O: " + objects.length);
            var noChance = false;
            for (var i = 0; i < objects.length; i++) {
                if (objects[i].min != 0) {
                    noChance = true;
                    break;
                }
            }

            if (noChance) {
                return 0;
            }
        } else if (currentHandSize > getHandSize()) {
            return 0;
        }

        var newChance = 1;
        var output = "";

        for (var i = 0; i < currentHand.length; i += 2) {
            output += "(" + currentHand[i] + " choose " + currentHand[i + 1] + ") * ";
            newChance *= choose(currentHand[i], currentHand[i + 1]);
        }

        if (currentHandSize < getHandSize()) {
            output += "(" + getMiscAmt() + "choose " + (getHandSize() - currentHandSize) + ") * ";
            newChance *= choose(getMiscAmt(), getHandSize() - currentHandSize);
        }

        // console.log(output.substring(0, output.length - 3));
        return newChance;
    }

    var obj = objects.pop();
    var chance = 0;

    for (var i = obj.min; i <= obj.max; i++) {

        currentHand.push(obj.amt);
        currentHand.push(i);

        chance += recursiveCalculate(currentHand, currentHandSize + i, objects);
        // console.log("N: " + chance);

        currentHand.pop();
        currentHand.pop();

    }

    objects.push(obj);

    return chance;
}

function factorial(x) {
    x = parseInt(x, 10);
    if (isNaN(x))
        return 1;
    if (x <= 0)
        return 1;
    if (x > 170)
        return Infinity;
    var y = 1;
    for (var i = x; i > 0; i--) {
        y *= i;
    }
    return y;
}

function choose(n, k) {
    n = parseInt(n, 10);
    if (isNaN(n))
        n = 0;
    if (n < 0)
        n = 0;

    k = parseInt(k, 10);
    if (isNaN(k))
        k = 0;
    if (k < 0)
        k = 0;
    //if (k > n) k = n;

    return (factorial(n)) / (factorial(k) * factorial(n - k));
}