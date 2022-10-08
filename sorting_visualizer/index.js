// Description:
// This is a webpage that demonstrates how sorting algorithms work. This javascript page is outlined with variables, functions, actions and the algorithms that make this happen. Upon loading the site, the page will auto load a new array, and the buttons/sliders and selector on the page will allow the user to select different variables and execute the sorting algorithm. The user inputs will not be accessible during sorting.


//                                                  VARIABLES                                                            //

let arraysize = document.querySelector("#arraysize").value;
let algorithm = document.querySelector("#algorithm").value;
let speed = document.querySelector("#speed").value;
let heightfactor = 5; // This will be used to make bars taller, as using smaller values makes them harder to see
let bar = document.getElementsByClassName("bar");

const generateNewArrayBtn = document.querySelector("#generateNewArray");
const visualizeBtn = document.querySelector("#visualize");
const arraysizeSlider = document.querySelector("#arraysize");
const speedBtn = document.querySelector("#speed");
const arrayContainer = document.querySelector("#array-container");
const algorithmSelector = document.querySelector("#algorithm");

// After loading page, this will create a random graph and render the bars
document.addEventListener("DOMContentLoaded", function () {
    generateNewArray();
    });

//                                                     USER ACTIONS                                                             //

generateNewArrayBtn.onclick = function(e) {
    generateNewArray();
}

arraysizeSlider.onchange = (e) => {
    arraysize = document.querySelector("#arraysize").value;
    generateNewArray();
}

speedBtn.onchange = (e) => {
    speed = document.querySelector("#speed").value;
}

algorithmSelector.onchange = (e) => {
    algorithm = document.querySelector("#algorithm").value;
}

visualizeBtn.onclick = (e) => {
    // Disable user inputs
    visualizeBtn.disabled = true;
    generateNewArrayBtn.disabled = true;
    arraysizeSlider.disabled = true;
    algorithmSelector.disabled = true;
    speedBtn.disabled = true;
    // Execute algorithm based on selection
    if (algorithm == "bubblesort") {
        bubblesort(array);
        // console.log("bubble sort");
    }
    else if (algorithm == "selectionsort") {
        selectionsort(array);
        // console.log("selection sort");
    }
    else if (algorithm == "insertionsort") {
        insertionsort(array);
        // console.log("insertion sort");
    }
    else if (algorithm == "quicksort") {
        quicksort(array, 0, arraysize - 1);
        // console.log("quick sort");
    }
    else if (algorithm == "mergesort") {
        // First create a copy of the array to modify - preserve original array and easier to show array changes
        alert("Merge sort does not display properly, continue?");
        let arr = [arraysize];
        for (let i = 0; i < arraysize; i++) {
            arr[i] = array[i];
        }
        mergesort(arr);
        // console.log("merge sort");
    }
    else if (algorithm == "heapsort") {
        heapsort(array);
        // console.log("heap sort");
    }
    else {
        console.log("no algorithm");
    }
}


//                                                   FUNCTIONS                                                              //

function generateNewArray() {
    arrayContainer.innerHTML = ""; // Clears current graph
    array = new Array(arraysize);
    for (let i = 0; i < arraysize; i++) {
        randNum = Math.floor(Math.random() * 100) +1;
        array[i] = randNum;
    }
    renderBars(array);
}

function renderBars(array) {
    for (let i = 0; i < arraysize; i++) {
        let bar = document.createElement("div");
        bar.classList.add("bar");
        bar.style.height = array[i] * heightfactor + "px";
        arrayContainer.appendChild(bar);
    }
}

function reset() {
    // Change graph color to show complete
    for (let m = 0; m < arraysize; m++) {
        bar[m].style.backgroundColor = "green";
    }
    // Enable user inputs
    visualizeBtn.disabled = false;
    generateNewArrayBtn.disabled = false;
    arraysizeSlider.disabled = false;
    algorithmSelector.disabled = false;
    speedBtn.disabled = false;
}

// Time function, delays sorting process for easier visuals
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}


//                                                SORTING ALGORITHMS                                                          //
// Source: https://www.freecodecamp.org/news/sorting-algorithms-explained-with-examples-in-python-java-and-c/

// SWAP FUNCTION
async function swap(array, i, j) {
    // Swap values
    let temp = array[i];
    array[i] = array[j];
    array[j] = temp;
    // Adjust bar heights
    bar[i].style.height = array[i] * heightfactor + "px";
    bar[j].style.height = array[j] * heightfactor + "px";
}

// BUBBLE SORT
async function bubblesort(array) {
    for (let i = 0; i < arraysize; i++) {
        for (let j = 0; j < arraysize - 1 - i; j++) {
            if (array[j] > array[j + 1]) {
                // Change color to represent active array
                for (let k = 0; k < arraysize; k++) {
                    if (k != j + 1) {
                        bar[k].style.backgroundColor = "yellow";
                    }
                }
                swap(array, j, j + 1);
                // Highlight largest bar
                bar[j + 1].style.backgroundColor = 'green';
                await sleep(speed);
            }
        }
    }
    reset();
}

// SELECTION SORT
async function selectionsort(array) {
    for (let i = 0; i < arraysize - 1; i++) {
        let min = i;
        for (let j = i + 1; j < arraysize; j++) {
            bar[j].style.backgroundColor = 'yellow'; 
            // If value is lower than current index, assign as current min
            if (array[j] < array[min]) {
                min = j;
            }
            bar[min].style.backgroundColor = "green"
            // Revert color for rest of bars
            for (let k = 0; k < arraysize; k++) {
                if (k != min && k != j) {
                    bar[k].style.backgroundColor = "darkgray";
                }
            }
            await sleep(speed);
        }
        // Swap min value with index
        swap(array, min, i);
    }
    reset();
}

// INSERTION SORT
async function insertionsort(array) {
    for (let i = 1; i < arraysize; i++) {
        // Set i as key and j for values before current index
        let key = array[i];
        let j= i - 1;
        // If value at index j is larger than current key, swap values one by one until it is in place
        while (j >= 0 && array[j] > key) {
            swap(array, j + 1, j);
            bar[j].style.backgroundColor = "yellow";
            for (let k = 0; k < arraysize; k++) {
                if (k != j) {
                    bar[k].style.backgroundColor = "darkgray";
                }
            }
            j--;
            await sleep(speed);
        }
        bar[j + 1].style.backgroundColor = "green";
        await sleep(speed);
    }
    reset();
}

// MERGE SORT
// Doing this sixth time... maybe come back to this and try using indexes as iterables instead of array so that way it tracks on graph where to make swaps - doesnt look right but works correctly
// Right now this method swaps array bars from index and value

// implement w indexes? try to pass indexes in the mergesort function, maybe this can maintain the indexes better
async function mergesort(arr) {
    if (arr.length < 2) {
      return arr;
    }
    // Create left and right sides
    const middle = Math.floor(arr.length / 2);
    const left = arr.slice(0, middle);
    const right = arr.slice(middle);
    await mergesort(left);
    await mergesort(right);
    // Initialize 
    let i = 0;
    let j = 0;
    let k = 0;
    // While i and j have values, swap value that is smaller with current index 
    while (i < left.length && j < right.length) {
        if (left[i] < right[j]) {
            arr[k] = left[i];
            find_and_swap(k, left[i]);
            i++;
            bar[k].style.backgroundColor = "lightgreen";
        }
        else {
            arr[k] = right[j];
            find_and_swap(k, right[j]);
            j++;
            bar[k].style.backgroundColor = "green";
        }
        // Visualize 
        bar[k].style.backgroundColor = "yellow";
        // if (k + arr.length < bar.length) {
            // console.log(arr[k] * heightfactor);
            // bar[k + arr.length].style.backgroundColor = "yellow";
        // }
        await sleep(speed);
        k++;
    }
    // If only left has value
    while (i < left.length) {
        arr[k] = left[i];
        find_and_swap(k, left[i]);
        bar[k].style.backgroundColor = "yellow";
        await sleep(speed);
        i++;
        k++;
    }
    // If only right has value
    while (j < right.length) {
        arr[k] = right[j];
        find_and_swap(k, right[j]);
        bar[k].style.backgroundColor = "yellow";
        await sleep(speed);
        j++;
        k++;
    }
    // Reset colors
    for (let k = 0; k < bar.length; k++) {
        bar[k].style.backgroundColor = "darkgray";
    }
    // Checking if main array is sorted
    if (isSorted(array) == true) reset();
}

// Find and replace current index with index of input, passing an index and a value
function find_and_swap(k, x) {
    index_a = k; // current index
    index_b = 0;
    for (let i = 0; i < arraysize; i++) {
        if (array[i] == x) {
            index_b = i;
        }
    }
    swap(array, index_a, index_b);
}

// HEAP SORT 
async function heapsort(array) {
    // Build heap
    for (let i = Math.floor(arraysize / 2); i >= 0; i--) {
        await heapify(array, arraysize, i);
    }
    // Extract each element one by one
    for (let i = arraysize - 1; i >=  0; i--) {
        swap(array, 0, i); // Swap root with i
        bar[i].style.backgroundColor = "lightgreen";
        await heapify(array, i, 0);
        await sleep(speed);
    }
    reset();
}

async function heapify(array, n, i) {
    let parent = i;
    let left = 2 * i + 1;
    let right = 2 * i + 2;
    // Modify heap, setting min as parent
    if (left < n && array[left] > array[parent]) {
        parent = left;
    }
    if (right < n && array[right] > array[parent]) {
        parent = right;
    }
    // Perform swap and heapify
    if (parent != i) {
        swap(array, parent, i);
        bar[parent].style.backgroundColor = "yellow";
        bar[i].style.backgroundColor = "yellow";
        await sleep(speed);
        bar[parent].style.backgroundColor = "darkgray";
        bar[i].style.backgroundColor = "darkgray";
        await heapify(array, n, parent);
    }
}

// QUICK SORT
async function quicksort(array, start, end) {
    if (start < end) {
        let pivot = await partition(array, start, end);
        await quicksort(array, start, pivot - 1);
        await quicksort(array, pivot + 1, end);
    }
    if (isSorted(array) == true) reset();
}

async function partition(array, start, end) {
    let pivot = end;
    let i = start - 1;
    let j = start;
    bar[pivot].style.backgroundColor = "red";
    while (j < pivot) {
        if (array[j] > array[pivot]) {
            j++;
        }
        else {
            i++;
            swap(array, j, i);
            bar[i].style.backgroundColor = "yellow";
            bar[j].style.backgroundColor = "yellow";
            for (let k = 0; k < arraysize; k++) {
                if (k != i && k != j && k != pivot) {
                    bar[k].style.backgroundColor = "darkgray";
                }
            }
            j++;
            await sleep(speed);
        }
    }
    swap(array, i + 1, pivot);
    bar[i + 1].style.backgroundColor = "yellow";
    bar[pivot].style.backgroundColor = "yellow";
    return i + 1;
}

// Returns true if function is sorted in ascending order
function isSorted(array) {
    let previousNo = null;
    for (const number of array) {
      if (previousNo != null && number < previousNo) {
        return false;
      }
      previousNo = number;
    }
    return true;
}