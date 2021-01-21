/**
 * Computes and displays number of classes per role in sidebar.
 */
function numClassesPerRole() {
    var rolecount = roles;
    for (var prop in rolecount) {
        rolecount[prop].count = 0;
    }
    classes.forEach((item, i) => {
        rolecount[item.label].count += 1;
    });
    var countelem = document.getElementById('class-count');
    countelem.innerHTML = "";
    for (var prop in rolecount) {
        countelem.innerHTML += prop + ": " + rolecount[prop].count + "<br>";
    }
}

/**
 * Computes placement, initializes calcLeaves.
 */
function placement() {
    let max_x = 0;
    let lvs = 0;
    [lvs, max_x] = calcPlacement(packagetree, 0, 0, 0, 100);
    packagetree.x = max_x / 2 - 21 / 2;
}

/**
 * Computes placement of all packages and classes in packagetree.
 * @param {object} pkg - package.
 * @param {int} x - x for current package.
 * @param {int} y - y for current package.
 * @param {int} n_x - next x for children of current package.
 * @param {int} n_y - next y for children of current package.
 */
function calcPlacement(pkg, x, y, n_x, n_y) {
    pkg.x = x;
    pkg.y = y;
    let numchildren = Object.keys(pkg.children).length;
    if (numchildren == 0) {
        pkg.leaves = 0;
        return [1, n_x];
    }
    let size = Math.floor(Math.ceil(Math.sqrt(numchildren)/2));
    let size_y = Math.ceil(Math.sqrt(numchildren)) * 2;
    let totlvs = 0;
    let lvs = 0;
    let size_x = 0;
    let nn_y = n_y + size_y * 21 + 100;
    let nn_x = n_x;
    Object.keys(pkg.children).forEach((key, index) => {
        x = n_x + (index%size) * 21;
        y = n_y + Math.floor(index/size) * 21;
        [lvs, size_x] = calcPlacement(pkg.children[key], x, y, nn_x, nn_y);
        nn_x += size_x - nn_x;
        totlvs += lvs;
    });
    let returnval = Math.max(n_x + (size*21), nn_x) + 10;
    Object.keys(pkg.children).forEach(key => {
        pkg.children[key].x = (returnval-n_x) / 2 - 21*size/2 + pkg.children[key].x;
    });
    pkg.leaves = totlvs;
    return [totlvs, returnval];
}
