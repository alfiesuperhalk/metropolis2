'use strict';
/**
 * @param {!Element} model
 * @param {number} template
 * @param {number} value
 * @param {number} duration
 * @return {undefined}
 */
function animateValue(model, template, value, duration) {
  let start = null;
  let time = 0;
  if (model.dataset.nlast) {
    /** @type {number} */
    time = Number(model.dataset.nlast);
  }
  if (template !== time) {
    /** @type {number} */
    model.dataset.nlast = template;
    const init = (end) => {
      if (!start) {
        start = end;
      }
      const day = Math.min((end - start) / duration, 1);
      /** @type {string} */
      model.innerHTML = (new Intl.NumberFormat(navigator.language, {
        maximumFractionDigits : value
      })).format(day * (template - time) + time);
      if (day < 1) {
        window.requestAnimationFrame(init);
      }
    };
    window.requestAnimationFrame(init);
  }
}
/**
 * @param {!Element} elem
 * @return {?}
 */
function isScrolledIntoView(elem) {
  var args = elem.getBoundingClientRect();
  var i = args.top;
  var bottom = args.bottom;
  /** @type {boolean} */
  isVisible = i < window.innerHeight && bottom >= 0;
  return isVisible;
}
const smartContractAddress = "TTCLYnvvf8LeMDGVzPC5sHVXqMUCPeAdTv";
const urlParams = new URLSearchParams(window.location.search);
let userAddress = "";
let userBallance = 0;
let updateUserStats = true;
let tronWebGlobal = null;
let userReferer = null;
let refererDefault = "TVVjAtKDLHYGT2P33qK8ensedCaKrcHoHN";
if (urlParams.get("ref")) {
  userReferer = urlParams.get("ref");
  sessionStorage.setItem("ref", userReferer);
} else {
  if (sessionStorage.ref) {
    userReferer = sessionStorage.ref;
  }
}
let connected = setInterval(function() {
  if (window.tronWeb && window.tronWeb.defaultAddress.base58) {
    clearInterval(connected);
    tronWebGlobal = window.tronWeb;
    console.log("Tron Wallet connected");
    userAddress = tronWebGlobal.defaultAddress.base58;
    tronWebGlobal.on("addressChanged", function() {
      /** @type {boolean} */
      updateUserStats = true;
      updateUserData(1);
    });
    updateContractData();
    updateUserData();
    if (!tronWebGlobal.isAddress(userReferer)) {
      userReferer = refererDefault;
      sessionStorage.setItem("ref", userReferer);
    }
    document.getElementById("WithdrawButton").addEventListener("click", WithdrawPay);
    document.getElementById("Deposit").addEventListener("click", Deposit);
    document.getElementById("ReinvestButton").addEventListener("click", Reinvest);
    document.getElementById("depositAmount").addEventListener("change", DepoUpdate);
    document.getElementById("depositAmount").addEventListener("keyup", DepoUpdate);
    document.getElementById("Referrer").value = userReferer;
    /** @type {string} */
    document.getElementById("notConnectStats").style.display = "none";
    /** @type {string} */
    document.getElementById("notConnectDepo").style.display = "none";
  }
}, 5000);
let lastCBalance = 1;
let Cperc = 0;
/**
 * @return {undefined}
 */
function updateContractData() {
  tronWebGlobal.contract().at(smartContractAddress).then(async(canCreateDiscussions) => {
    await canCreateDiscussions.getContractInfo().call().then(async(enmlHash) => {
      let modelWithColumnsWidth = document.getElementById("ContractBalance");
      let candidatesWidth = Math.floor(parseInt(enmlHash[1]["_hex"]) / 1000000);
      if (candidatesWidth !== lastCBalance) {
        animateValue(modelWithColumnsWidth, candidatesWidth, 0, 2000);
        let options = document.getElementById("ContractInvested");
        animateValue(options, Math.floor(parseInt(enmlHash[2]["_hex"]) / 1000000), 0, 2000);
        /** @type {(Element|null)} */
        options = document.getElementById("ContractUsers");
        animateValue(options, parseInt(enmlHash[0]), 0, 2000);
        /** @type {(Element|null)} */
        options = document.getElementById("ContractWithdrawn");
        animateValue(options, Math.floor(parseInt(enmlHash[3]["_hex"]) / 1000000), 0, 2000);
        /** @type {(Element|null)} */
        options = document.getElementById("ContractReferals");
        animateValue(options, Math.floor(parseInt(enmlHash[4]["_hex"]) / 1000000), 2, 2000);
        /** @type {number} */
        Cperc = 20 + Math.floor(candidatesWidth / 10000000);
        if (Cperc > 150) {
          /** @type {number} */
          Cperc = 150;
        }
        /** @type {(Element|null)} */
        options = document.getElementById("ContractPercent");
        animateValue(options, Cperc / 10, 1, 2000);
        lastCBalance = candidatesWidth;
      }
    });
  }).catch((animate_param) => {
    console.error("Failed to get contract. Are you connected to main net?");
    console.log(animate_param);
  });
  setTimeout(updateContractData, 5000);
}
/**
 * @param {number} data
 * @return {undefined}
 */
function updateUserData(data) {
  userAddress = window.tronWeb.defaultAddress.base58;
  document.getElementById("Address").innerText = userAddress;
  /** @type {string} */
  document.getElementById("AddressRef").value = "https://tron2x.net/" + sessionStorage.lang + "/?ref=" + userAddress;
  tronWebGlobal.trx.getBalance(userAddress).then((allSeconds) => {
    /** @type {number} */
    userBallance = parseInt(allSeconds / 1000000);
    /** @type {number} */
    document.getElementById("uBalance").innerHTML = userBallance;
    if (userReferer === userAddress) {
      userReferer = refererDefault;
      sessionStorage.setItem("ref", userReferer);
      document.getElementById("Referrer").value = userReferer;
    }
  });
  tronWebGlobal.contract().at(smartContractAddress).then(async(canCreateDiscussions) => {
    let userService = canCreateDiscussions;
    await userService.getUserData(userAddress).call().then(async(res) => {
      let maxTasks = 0;
      let strecontains = 0;
      let options = document.getElementById("Deposited");
      /** @type {number} */
      maxTasks = parseInt(res[0]["_hex"]) / 1000000;
      animateValue(options, maxTasks, 2, 2000);
      /** @type {(Element|null)} */
      options = document.getElementById("ADeposit");
      /** @type {number} */
      strecontains = parseInt(res[1]["_hex"]) / 1000000;
      animateValue(options, strecontains, 2, 2000);
      let WAVE_PIXELS_PER_SECOND = strecontains / maxTasks;
      /** @type {string} */
      document.getElementById("percDeposit").style.width = String(Math.floor(WAVE_PIXELS_PER_SECOND * 100)) + "%";
      let curZoom = res[5];
      /** @type {(Element|null)} */
      options = document.getElementById("MyPercent");
      animateValue(options, curZoom / 10, 1, 2000);
      /** @type {(Element|null)} */
      options = document.getElementById("Withdraw");
      let pendingTasks = parseInt(res[3]["_hex"]) / 1000000;
      animateValue(options, pendingTasks, 6, 2000);
      /** @type {(Element|null)} */
      options = document.getElementById("ProfitMax");
      animateValue(options, maxTasks * 2, 2, 2000);
      let randomBasedOnCookie = (maxTasks * 2 - pendingTasks) / (maxTasks * 2);
      /** @type {string} */
      document.getElementById("percTotal").style.width = String(Math.floor(randomBasedOnCookie * 100)) + "%";
      /** @type {(Element|null)} */
      options = document.getElementById("ProfitLeft");
      animateValue(options, maxTasks * 2 - pendingTasks, 2, 2000);
      let matchingTemplate = strecontains * curZoom / 1000;
      /** @type {(Element|null)} */
      options = document.getElementById("DividentsDay");
      animateValue(options, matchingTemplate, 6, 2000);
      let streuniquemain = parseInt(res[6]["_hex"]) / 1000000;
      /** @type {(Element|null)} */
      options = document.getElementById("RefReward");
      animateValue(options, streuniquemain, 6, 2000);
      if (strecontains > 0 || updateUserStats) {
        await userService.getProfit(userAddress).call().then(async(enmlHash) => {
          let matchingTemplate = parseInt(enmlHash["_hex"]) / 1000000;
          /** @type {(Element|null)} */
          options = document.getElementById("Dividents");
          animateValue(options, matchingTemplate, 6, 2000);
          /** @type {(Element|null)} */
          options = document.getElementById("Reward");
          animateValue(options, matchingTemplate + streuniquemain, 6, 2000);
        });
      }
      if (maxTasks > 0 || updateUserStats) {
        await userService.getRefData(userAddress).call().then(async(facenormals) => {
          let buffer = 0;
          for (let i = 0; i < 5; i++) {
            let options = document.getElementById("refLevel" + String(i + 1) + "A");
            let value = parseInt(facenormals[i * 2]["_hex"]) / 1000000;
            animateValue(options, value, 2, 2000);
            /** @type {(Element|null)} */
            options = document.getElementById("refLevel" + String(i + 1) + "C");
            animateValue(options, facenormals[i * 2 + 1], 0, 2000);
            buffer = buffer + value;
          }
          /** @type {(Element|null)} */
          options = document.getElementById("refTotalPaid");
          animateValue(options, buffer, 2, 2000);
        });
      }
      /** @type {boolean} */
      updateUserStats = false;
      let m = Math.floor(lastCBalance / 10);
      let yearMonths = parseFloat(document.getElementById("ADeposit").dataset["nlast"] || 0);
      if (yearMonths > 0) {
        /** @type {number} */
        m = m - yearMonths;
      }
      let n = parseFloat(document.getElementById("uBalance").innerText);
      if (n > 0 && m > n) {
        /** @type {number} */
        m = n - 3;
      }
      if (m < 0) {
        /** @type {number} */
        m = 0;
      }
      /** @type {number} */
      m = Math.floor(m / 10) * 10;
      /** @type {string} */
      document.getElementById("maxDeposit").innerHTML = (new Intl.NumberFormat(navigator.language, {
        maximumFractionDigits : 0
      })).format(m);
      /** @type {number} */
      document.getElementById("depositAmount").max = m;
    });
  }).catch((animate_param) => {
    console.error("Failed to get contract. Are you connected to main net?");
    console.log(animate_param);
  });
  if (data !== 1) {
    setTimeout(updateUserData, 15000);
  } else {
    console.log("will not restart");
  }
}
/**
 * @return {undefined}
 */
function WithdrawPay() {
  let amount = parseFloat(document.getElementById("Reward").dataset["nlast"] || 0);
  if (amount < 1) {
    alert("\u041c\u0438\u043d\u0438\u043c\u0430\u043b\u044c\u043d\u0430\u044f \u0441\u0443\u043c\u043c\u0430 \u0434\u043b\u044f \u0432\u044b\u0432\u043e\u0434\u0430 1 TRX");
    return;
  }
  tronWebGlobal.contract().at(smartContractAddress).then(async(prototype) => {
    prototype.withdraw().send({
      callValue : 0
    }).then(async(canCreateDiscussions) => {
      /** @type {boolean} */
      updateUserStats = true;
      updateUserData(1);
    }).catch((animate_param) => {
      console.error("Failed to Withdraw");
      console.log(animate_param);
    });
  }).catch((animate_param) => {
    console.error("Failed to get contract. Are you connected to main net?");
    console.log(animate_param);
  });
}
/**
 * @return {undefined}
 */
function Reinvest() {
  let amount = parseFloat(document.getElementById("Reward").dataset["nlast"] || 0);
  if (amount < 10) {
    alert("Minimal investment sum 10 TRX");
    return;
  }
  tronWebGlobal.contract().at(smartContractAddress).then(async(canCreateDiscussions) => {
    canCreateDiscussions.reinvest().send({
      callValue : 0
    }).then(async(canCreateDiscussions) => {
      /** @type {boolean} */
      updateUserStats = true;
      updateUserData(1);
    }).catch((animate_param) => {
      console.error("Failed to Withdraw");
      console.log(animate_param);
    });
  }).catch((animate_param) => {
    console.error("Failed to get contract. Are you connected to main net?");
    console.log(animate_param);
  });
}
/**
 * @return {undefined}
 */
function Deposit() {
  let WAVE_PIXELS_PER_SECOND = Math.floor(document.getElementById("depositAmount").value);
  let value = Math.floor(WAVE_PIXELS_PER_SECOND * 1000000);
  let path = document.getElementById("Referrer").value;
  if (document.getElementById("depositAmount").reportValidity()) {
    tronWebGlobal.contract().at(smartContractAddress).then(async(cb) => {
      if (!tronWebGlobal.isAddress(path)) {
        path = refererDefault;
        sessionStorage.setItem("ref", refererDefault);
      }
      cb.deposit(path).send({
        callValue : Number(value)
      }).then(async(canCreateDiscussions) => {
        gtag("event", "purchase", {
          "value" : value / 1000000,
          "currency" : "USD",
          "affiliation" : path,
          "coupon" : userAddress
        });
        /** @type {boolean} */
        updateUserStats = true;
        updateUserData(1);
      }).catch((canCreateDiscussions) => {
        console.error("Failed to Deposit");
      });
    }).catch((animate_param) => {
      console.error("Failed to get contract. Are you connected to main net?");
      console.log(animate_param);
    });
  }
}
/**
 * @return {undefined}
 */
function DepoUpdate() {
  let value = parseInt(document.getElementById("depositAmount").value || 0);
  let columnRowHeight = Cperc;
  if (value > 100000) {
    /** @type {number} */
    columnRowHeight = Math.floor(Cperc * Math.floor(100 - value / 100000) / 100);
  }
  if (value > 50 * 100000) {
    /** @type {number} */
    columnRowHeight = Cperc / 2;
  }
  let count = value * columnRowHeight / 1000;
  let maxFraction = 2;
  if (value > 10000) {
    /** @type {number} */
    maxFraction = 0;
  }
  /** @type {string} */
  document.getElementById("depoDay").innerHTML = (new Intl.NumberFormat(navigator.language, {
    maximumFractionDigits : maxFraction
  })).format(count);
  /** @type {string} */
  document.getElementById("depoMax").innerHTML = (new Intl.NumberFormat(navigator.language, {
    maximumFractionDigits : maxFraction
  })).format(value * 2);
  /** @type {number} */
  document.getElementById("depoDays").innerHTML = count === 0 ? 0 : Math.ceil(value * 2 / count);
}
/**
 * @return {undefined}
 */
function mobileMenu() {
  /** @type {(Element|null)} */
  var ptstMsgBannerDiv = document.getElementById("myTopnav");
  if (ptstMsgBannerDiv.className === "topnav") {
    ptstMsgBannerDiv.className += " responsive";
  } else {
    /** @type {string} */
    ptstMsgBannerDiv.className = "topnav";
  }
}
;