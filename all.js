// 全域變數
const apiUrl = "https://todoo.5xcamp.us";

// 會員註冊
const signupEmailValue = document.querySelector(".signup-email-value");
const signupNicknameValue = document.querySelector(".signup-nickname-value");
const signupPwdValue = document.querySelector(".signup-pwd-value");
const signupSignupBtn = document.querySelector(".signup-signup-btn");

signupSignupBtn.addEventListener("click", () => {
  signUp(
    signupEmailValue.value,
    signupNicknameValue.value,
    signupPwdValue.value
  );
});

function signUp(email, nickName, pwd) {
  axios
    .post(`${apiUrl}/users`, {
      user: {
        email: email,
        nickname: nickName,
        password: pwd,
      },
    })
    .then((res) => {
      console.log(res);
      switchPage(res.status);
      customUserName(res.data.nickname);
      login(email, pwd);
    })
    .catch((error) => console.log(error.response));
}

// 會員登入
const loginEmailValue = document.querySelector(".login-email-value");
const loginPwdValue = document.querySelector(".login-pwd-value");
const loginBtn = document.querySelector(".login-btn");
const signupBtn = document.querySelector(".signup-btn");

loginBtn.addEventListener("click", () => {
  login(loginEmailValue.value, loginPwdValue.value);
  loginEmailValue.value = "";
  loginPwdValue.value = "";
});

function login(email, pwd) {
  axios
    .post(`${apiUrl}/users/sign_in`, {
      user: {
        email: email,
        password: pwd,
      },
    })
    .then((res) => {
      console.log(res);
      axios.defaults.headers.common["Authorization"] =
        res.headers.authorization;
      switchPage(res.status);
      getToDos(); // 順序不能錯，必須先執行將 JWT Token 存到 axios 的動作
      customUserName(res.data.nickname);
    })
    .catch((error) => console.log(error.response));
}

// 會員登出
const signoutBtn = document.querySelector(".todolist-signout");

signoutBtn.addEventListener("click", signOut);

function signOut() {
  axios
    .delete(`${apiUrl}/users/sign_out`)
    .then((res) => {
      console.log(res);
      switchToLoginPage();
      taskData = [];
      window.location.reload();
    })
    .catch((error) => console.log(error.response));
}

// 頁面切換
const frontPage = document.querySelector(".frontPage");
const sectionLogin = document.querySelector(".section-login");
const sectionSignup = document.querySelector(".section-signup");
const todolistPage = document.querySelector(".todolist-page");
const backToLoginBtn = document.querySelector(".signup-backToLogin-btn");

signupBtn.addEventListener("click", switchToSignupPage);

backToLoginBtn.addEventListener("click", switchToLoginPage);

function switchToSignupPage(e) {
  if (e.target.getAttribute("class") == "signup-btn") {
    sectionLogin.setAttribute("class", "section-login none");
    sectionSignup.setAttribute("class", "section-signup");
  }
}

function switchPage(param) {
  if (param === 200 || 201) {
    frontPage.setAttribute("class", "frontPage none");
    sectionLogin.setAttribute("class", "section-login none");
    todolistPage.setAttribute("class", "todolist-page");
  }
}

function switchToLoginPage() {
  todolistPage.setAttribute("class", "todolist-page none");
  sectionSignup.setAttribute("class", "section-signup none");
  frontPage.setAttribute("class", "frontPage");
  sectionLogin.setAttribute("class", "section-login");
}

// 取得並修改用戶名稱為暱稱（待辦頁面右上方）
const userNickName = document.querySelector(".user-nickname");

function customUserName(usernickname) {
  userNickName.textContent = `${usernickname}'s TO DO LIST`;
}

//取得 To do 資料
function getToDos() {
  axios
    .get(`${apiUrl}/todos`)
    .then((res) => {
      console.log(res.data.todos);
      taskData = res.data.todos;
      updateList();
    })
    .catch((error) => console.log(error.response));
}

//修改 To do
function editToDos(taskId, toDoContent) {
  axios
    .put(`${apiUrl}/todos/${taskId}`, {
      todo: {
        content: toDoContent,
      },
    })
    .then((res) => console.log(res.data))
    .catch((error) => console.log(error.response));
}

// 宣告空物件（待辦事項容器）
let taskData = [];

// 新增待辦事項
const addBtn = document.querySelector(".btn_add");
const taskContent = document.querySelector(".taskContent");

addBtn.addEventListener("click", addTask);

function addTask() {
  // 輸入欄位防呆
  if (taskContent.value.trim() == "") {
    alert("Task input should not be empty!");
  } else {
    addToDos(taskContent.value).then((result) => {
      console.log("add result: ", result);
      getToDos();
    });
  }
  taskContent.value = "";
}

function addToDos(toDoContent) {
  return new Promise((resolve, reject) => {
    axios
      .post(`${apiUrl}/todos`, {
        todo: {
          content: toDoContent,
        },
      })
      .then((res) => {
        // console.log(res.data);
        resolve(res.data);
      })
      .catch((error) => {
        // console.log(error.response);
        reject(error.response);
      });
  });
}

// 刪除指定待辦事項 (和修改待辦狀態功能)
const list = document.querySelector(".list");

list.addEventListener("click", deleteOrToggleTask);

function deleteOrToggleTask(e) {
  let id = e.target.closest("li").dataset.id;
  if (e.target.getAttribute("class") == "delete") {
    delToDos(id).then((result) => {
      getToDos();
    })
  } else {
    // 修改 task 狀態
    taskData.forEach((item) => {
      if (item.id == id) {
        if (item.completed_at == null) {
          toggleToDos(item.id).then((result) => {
            console.log("toggle result: ", result);
            getToDos();
          })
        } else {
          item.completed_at = null;
          toggleToDos(item.id).then((result) => {
            console.log("toggle result: ", result);
            getToDos();
          })
        }
      }
    });
  }
}

function delToDos(taskId) {
  return new Promise((resolve, reject) => {
    axios
    .delete(`${apiUrl}/todos/${taskId}`)
    .then((res) => {
      console.log(res.data);
      resolve();
    })
    .catch((error) => {
      console.log(error.response);
      reject(error.response);
    });
  })
}

function toggleToDos(taskId) {
  return new Promise((resolve, reject) => {
    axios
    .patch(`${apiUrl}/todos/${taskId}/toggle`, {})
    .then((res) => {
      console.log(res.data)
      resolve(res.data)
    })
    .catch((error) => {
      console.log(error.response);
      reject(error.response);
    });
  });
}

// 畫面渲染 (和未完成待辦項目計算功能)
const unFinishedTaskCounter = document.querySelector(".list_footer p");

function updateList() {
  let str = "";
  taskData.forEach((item, index) => {
    str += `<li data-id=${item.id}>
          <label class="checkbox">
            <input type="checkbox" ${
              item.completed_at == null ? "" : "checked"
            }/>
            <span>${item.content}</span>
          </label>
          <a href="#" class="delete" ${index}></a>
        </li>`;
  });
  list.innerHTML = str;
  // 顯示「待完成項目」數量功能（筆記：發現需要隨著 taskData 動態更新，才可即時記錄待完成項目的數量）
  let unFinishedTasks = taskData.filter((item) => item.completed_at == null);
  unFinishedTaskCounter.textContent = `${unFinishedTasks.length} Unfinished tasks`;
}

// 製作狀態 tab 切換功能
// 為 tabs 加上事件監聽
const tab = document.querySelector(".tab");

tab.addEventListener("click", changeTab);
let tabStatus = "all";

// 宣告 changeTab 函式的內容
function changeTab(e) {
  tabStatus = e.target.dataset.tab;
  const tabs = document.querySelectorAll(".tab li");
  tabs.forEach((item) => item.classList.remove("active"));
  e.target.classList.add("active");``
  filterList();
}

function filterList() {
  let filteredList = [];
  if (tabStatus == "all") {
    filteredList = taskData;
  } else if (tabStatus == "wip") {
    filteredList = taskData.filter((item) => item.completed_at == null);
  } else {
    filteredList = taskData.filter((item) => item.completed_at !== null);
  }
  updateList(filteredList);
}

// 製作刪除所有已完成項目功能
const clearAllFinishedTasks = document.querySelector(".list_footer a");

clearAllFinishedTasks.addEventListener("click", deleteAllFinishedTasks);

// function deleteAllFinishedTasks(e) {
//   e.preventDefault();
//   taskData.forEach(item => {
//     if (item.completed_at !`== null) {
//       delToDos(item.id).then((result) => {
//     ``    getToDos();
//       })
//     }
//   });
// }

// test
function deleteAllFinishedTasks(e) {
  e.preventDefault();
  let promiseArr = taskData
    .filter(item => item.completed_at !== null)
    .map(item => delToDos(item.id));
  console.log(promiseArr);
  Promise.all(promiseArr).then(item => {
    console.log('Wait promise all');
    getToDos();
  })
}
