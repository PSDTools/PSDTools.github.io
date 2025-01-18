/**
 * The main script for the GPA Calculator.
 *
 * @remarks
 * While it is fetched asynchronously, it is executed synchronously.
 * Therefore, it is important to keep the script as fast as possible.
 */

// cspell:ignore LGID, CTID, CTYID, cltyp

import "./styles/global.css";

import html from "html-template-tag";

import { type Course, newCourse } from "./data/data-types.ts";
import {
  clearAll,
  clearData,
  getData,
  getGrade,
  setData,
  setGrade,
} from "./scripts/storage.ts";

declare global {
  function classAmount(): Promise<void>;
  function clearAll(): Promise<void>;
  function clearData(): Promise<void>;
  function darkMode(): Promise<void>;
  function hsmsSwap(): Promise<void>;
  function loadGpa(): Promise<void>;
  function startApp(): Promise<void>;
  function toggleNav(open: boolean): void;
}

let courses: Course[] = [];
let classAmountNum = 0;

let tempLGID = "";
let tempCTID = "";
let tempCTYID = "";
let tempElementId = "";
let tempElementIdNext = "";

const high = "High School";
const middle = "Middle School";
const hsmsInput = document.querySelector("input#hsmsInput")!;
const gradeLvl = document.querySelector("#gradeLvl")!;

globalThis.clearData = clearData;
globalThis.clearAll = clearAll;

/**
 * Toggle the navigation.
 * If it's going to open:
 * - Set the width of the side navigation to 250px and the left margin of the page content to 250px and add a black background color to the body.
 * - Otherwise, set the width of the side navigation to 0 and the left margin of the page content to 0, and the background color of the body to white.
 *
 * @param open - If you want to open the sidebar (defaults to close).
 */
function toggleNav(open: boolean): void {
  const classlist = document.querySelector("div#mySidenav")?.classList;
  const w100 = "w-full";
  const w0 = "w-0";

  classlist?.add(open ? w100 : w0);
  classlist?.remove(open ? w0 : w100);
}
globalThis.toggleNav = toggleNav;

function getTypeIds(): NodeListOf<HTMLSpanElement> {
  return document.querySelectorAll('span[id^="typeId"]');
}

/**
 * Swaps the High School and the Middle School.
 */
async function hsmsSwap(): Promise<void> {
  const { checked } = hsmsInput;

  if (checked) {
    gradeLvl.innerHTML = high;

    await setGrade(String(checked));
    document.querySelector("input#numOfClasses")!.value = String(
      courses.length,
    );

    for (const element of getTypeIds()) {
      element.innerHTML = html`<form>
        <select class="blacktxt" id="cltyp${element.id.slice(6)}">
          <option value="1">No-Weight</option>
          <option value="2">Honors</option>
        </select>
      </form>`;
    }
  } else {
    gradeLvl.innerHTML = middle;
    await setGrade(String(checked));

    for (const element of getTypeIds()) {
      element.innerHTML = "";
    }
  }
}
globalThis.hsmsSwap = hsmsSwap;

/**
 * Create a `Course`.
 */
function createCourse(num: number): void {
  tempElementId = `temp${num}`;
  tempElementIdNext = `temp${num + 1}`;

  const stringNum = num.toString();

  // creates html elements in the courses class
  document.querySelector(`div#${tempElementId}`)!.innerHTML = html`<div
      oninput="loadGpa();"
      class="pb-4 pt-4 text-lg lg:text-2xl"
    >
      <div id="input-con-div">
        <input
          class="blacktxt w-36 placeholder-white hover:scale-105"
          placeholder="Class ${stringNum}:"
          oninput="loadGpa();"
          id="cl${stringNum}txt"
          type="text"
          required=""
        />
        <span class="float-right" id="typeId${stringNum}">
          <form>
            <select class="blacktxt hover:scale-105" id="cltyp${stringNum}">
              <option value="1">No-Weight</option>
              <option value="2">Honors</option>
            </select>
          </form>
        </span>

        <input
          type="range"
          min="0"
          max="4"
          value="4"
          class="slider float-right w-1/2 hover:scale-105"
          id="slide${stringNum}"
          oninput="document.querySelector('#cl${stringNum}').value = document.querySelector('#slide${stringNum}').value;loadGpa();"
        />
        <select
          class="blacktxt float-right appearance-none hover:scale-105"
          oninput="document.querySelector('#slide${stringNum}').value = document.querySelector('#cl${stringNum}').value;loadGpa();"
          id="cl${stringNum}"
        >
          <option value="4">A</option>
          <option value="3">B</option>
          <option value="2">C</option>
          <option value="1">D</option>
          <option value="0">F</option>
          <option value="5">N/A</option>
        </select>
      </div>
    </div>
    <div class="selectionbox" id="${tempElementIdNext}"></div>`;
}

/**
 * Remove "Saved!" text.
 */
function saveRemove(): void {
  const element = document.querySelector("#saved");

  if (element !== null) {
    element.innerHTML = "";
  }
}

/**
 * Saves values to the array.
 */
async function loadGpa(): Promise<void> {
  // set vars
  let preGpa = 0;
  let courseLen = courses.length;

  tempLGID = "";
  tempCTID = "";
  tempCTYID = "";

  // save classes to array
  for (const [itr, course] of courses.entries()) {
    tempLGID = `cl${itr + 1}`;
    tempCTID = `cl${itr + 1}txt`;
    tempCTYID = `cltyp${itr + 1}`;

    course.letterGrade = Number(
      document.querySelector(`select#${tempLGID}`)!.value,
    );

    course.classText = document.querySelector(`input#${tempCTID}`)!.value;
  }

  // remove N/A from addition
  for (const course of courses) {
    if (course.letterGrade === 5) {
      courseLen -= 1;
    } else {
      preGpa +=
        (
          course.classType === "2" &&
          hsmsInput.checked &&
          course.letterGrade !== 0
        ) ?
          1 + course.letterGrade
        : course.letterGrade;
    }
  }

  // Divide.
  const gpa = preGpa / courseLen;
  // Round.
  const roundedGpa = Math.round(gpa * 100) / 100;

  document.querySelector("h2#gpa")!.innerHTML = `Your GPA is a: ${roundedGpa}`;

  // shows save text
  document.querySelector("p#saved")!.innerHTML = "Saved!";
  setTimeout(saveRemove, 1000);

  // save storage
  await setData(courses);
  for (const [itr] of courses.entries()) {
    document.querySelector(`input#slide${itr + 1}`)!.value =
      document.querySelector(`select#cl${itr + 1}`)!.value;
  }
}
globalThis.loadGpa = loadGpa;

async function classAmount(): Promise<void> {
  courses = []; // if storage don't exist, create the array

  // get textbox with number of classes
  classAmountNum = Math.abs(
    parseInt(document.querySelector("input#numOfClasses")!.value),
  );

  if (
    classAmountNum === 0 ||
    Number.isNaN(classAmountNum) ||
    classAmountNum > 256
  ) {
    classAmountNum = 7; // stops NaN/0/null on numOfClasses textbox
  }

  // creates classes for number of iterations
  for (let itr = 0; itr < classAmountNum; itr++) {
    courses.push(newCourse({ classNum: itr + 1 }));
    createCourse(itr + 1);
  }
  if (!hsmsInput.checked) {
    // loops through all course classes and removes the honors dropdowns
    for (const element of getTypeIds()) {
      element.innerHTML = "";
    }
  }

  // calculates and saves the gpa
  await loadGpa();
  // sets the gpa text to ""
  document.querySelector("h2#gpa")!.innerHTML = "";
}
globalThis.classAmount = classAmount;

/**
 * Populates course object data.
 */
function createStorageCourse(classNum: number): void {
  const num = classNum;

  tempElementId = `temp${num}`;
  tempElementIdNext = `temp${num + 1}`;
}

/**
 * Not to be confused with {@link getStorage}.
 */
function fromStorage(arraystorage: Course[]): void {
  courses = arraystorage;
  // creates courses from array data after it is pulled from storage

  for (const course of courses) {
    createCourse(course.classNum);
    createStorageCourse(course.classNum);
  }
  for (const [itr] of courses.entries()) {
    tempLGID = `cl${itr + 1}`;
    tempCTID = `cl${itr + 1}txt`;
    tempCTYID = `cltyp${itr + 1}`;

    for (const course of courses) {
      createCourse(course.classNum);
      createStorageCourse(course.classNum);
    }

    for (const [itr2, course] of courses.entries()) {
      tempLGID = `cl${itr2 + 1}`;
      tempCTID = `cl${itr2 + 1}txt`;
      tempCTYID = `cltyp${itr2 + 1}`;

      document.querySelector(`select#${tempLGID}`)!.value = String(
        course.letterGrade,
      );
      document.querySelector(`input#${tempCTID}`)!.value = course.classText;
      document.querySelector(`select#${tempCTYID}`)!.value = course.classType;
    }

    if (!hsmsInput.checked) {
      for (const element of getTypeIds()) {
        element.innerHTML = "";
      }
    }
  }
}

/**
 * Called on page load.
 *
 * Pulls data from storage.
 */
async function getStorage(): Promise<void> {
  const gradestorage = await getGrade();
  const arraystorage = await getData();

  if (gradestorage === "true") {
    hsmsInput.checked = true;
    gradeLvl.innerHTML = high;
  } else if (gradestorage === "false") {
    hsmsInput.checked = false;
    gradeLvl.innerHTML = middle;
  }
  if (arraystorage === null) {
    // if storage doesn't exist
    await classAmount();
  } else {
    // if storage does exist
    fromStorage(arraystorage);
    await loadGpa();
  }
  if (gradestorage === "false") {
    await hsmsSwap();
  }
}

async function startApp(): Promise<void> {
  await getStorage();
}

globalThis.startApp = startApp;
