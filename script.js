'use strict';

const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2024-01-24T14:43:26.374Z',
    '2024-01-25T14:43:26.374Z',
    '2024-02-26T14:43:26.374Z',
    '2024-02-27T14:43:26.374Z',
    '2024-04-29T14:43:26.374Z',
    '2024-04-30T18:49:59.371Z',
    '2024-05-01T12:01:20.894Z',
    '2024-05-01T12:01:20.894Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT',
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2024-04-24T14:43:26.374Z',
    '2024-04-25T14:43:26.374Z',
    '2024-04-26T14:43:26.374Z',
    '2024-04-27T14:43:26.374Z',
    '2024-04-29T14:43:26.374Z',
    '2024-04-30T18:49:59.371Z',
    '2024-05-01T12:01:20.894Z',
    '2024-05-01T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const account3 = {
  owner: 'Ahmad Mohammad Mahmoud',
  movements: [200, -200, 340, -300, -20, 50, 400, -460],
  interestRate: 0.7,
  pin: 3333,
  movementsDates: [
    '2024-01-01T14:43:26.374Z',
    '2024-02-02T14:43:26.374Z',
    '2024-02-03T14:43:26.374Z',
    '2024-02-27T14:43:26.374Z',
    '2024-03-03T14:43:26.374Z',
    '2024-03-30T18:49:59.371Z',
    '2024-04-26T12:01:20.894Z',
    '2024-05-01T12:01:20.894Z',
  ],
  currency: 'JOD',
  locale: 'ar-JO',
};

const accounts = [account1, account2, account3];

/////////////////////////////////////////////////
// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

let sorted = false;

const createUsernames = function (accounts) {
  accounts.forEach(account => {
    account.username = account.owner
      .toLowerCase()
      .split(' ')
      .map(name => name[0])
      .join('');
  });
};

createUsernames(accounts);

const comparator = function (a, b) {
  return a - b;
};

const calcDaysPassed = (date1, date2) =>
  Math.round(Math.abs(date2 - date1) / 1000 / 60 / 60 / 24);

const formatDate = function (date, locale, label = false) {
  const daysPassed = calcDaysPassed(new Date(), date);

  if (daysPassed === 0 && !label) return 'Today';
  if (daysPassed === 1) return 'Yesterday';
  if (daysPassed >= 2 && daysPassed <= 6) return `${daysPassed} days ago`;

  return new Intl.DateTimeFormat(locale).format(date);
};

const formatCurrency = function (val, locale, cur) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: cur,
  }).format(val);
};

const showMovements = function (account, sort = false) {
  const now = new Date();
  labelDate.textContent = formatDate(now, account.locale, true);

  const movements = sort
    ? account.movements.slice().sort((a, b) => a - b)
    : account.movements;

  containerMovements.innerHTML = '';
  movements.forEach((mov, i) => {
    const movType = mov > 0 ? 'deposit' : 'withdrawal';

    const html = `<div class="movements__row">
                  <div class="movements__type movements__type--${movType}">
                    ${i + 1} ${movType}
                 </div>
                  <div class="movements__date">${formatDate(
                    new Date(account.movementsDates[i]),
                    account.locale,
                    false
                  )}</div>
                  <div class="movements__value">${formatCurrency(
                    mov,
                    account.locale,
                    account.currency
                  )}</div>
                </div>`;
    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

const calculateDisplayBalance = function (account) {
  account.balance = account.movements.reduce((acc, mov) => acc + mov, 0);
  labelBalance.textContent = `${formatCurrency(
    account.balance,
    account.locale,
    account.currency
  )}`;
};

const calculateDisplaySummary = function (account) {
  labelSumIn.textContent = formatCurrency(
    account.movements.filter(mov => mov > 0).reduce((acc, mov) => acc + mov, 0),
    account.locale,
    account.currency
  );

  labelSumOut.textContent = formatCurrency(
    Math.abs(
      account.movements
        .filter(mov => mov < 0)
        .reduce((acc, mov) => acc + mov, 0)
    ),
    account.locale,
    account.currency
  );

  //Bank takes 1.2 percent interest on each deposit
  labelSumInterest.textContent = formatCurrency(
    account.movements
      .filter(mov => mov > 0)
      .map(dep => (dep * account.interestRate) / 100)
      .filter(int => int >= 1)
      .reduce((acc, int) => acc + int, 0),
    account.locale,
    account.currency
  );
};

const updateUI = function (account) {
  //1) Displaying Movements
  showMovements(account);

  //2) Displaying Balance
  calculateDisplayBalance(account);

  //3) Displaying Summary
  calculateDisplaySummary(account);
};

const startLogOutTimer = function () {
  const tick = () => {
    const minutes = String(Math.trunc(time / 60)).padStart(2, 0); //02:59
    const seconds = String(time % 60).padStart(2, 0);

    labelTimer.textContent = `${minutes}:${seconds}`;

    if (time === 0) {
      clearInterval(timer);
      containerApp.style.opacity = 0;
      labelWelcome.textContent = `Log in to get started`;
    }
    time--;
  };

  let time = 300;
  tick();

  const timer = setInterval(tick, 1000);
  return timer;
};

let currentAccount, timer;
btnLogin.addEventListener('click', function (e) {
  e.preventDefault();
  sorted = false;

  //Checking Credentials
  currentAccount = accounts.find(
    acc =>
      inputLoginUsername.value === acc.username &&
      +inputLoginPin.value === acc.pin
  );

  if (currentAccount) {
    //Starting the countdown till automatic logout happens
    if (timer) clearInterval(timer);
    timer = startLogOutTimer();
    //Greeting the user
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(' ')[0]
    }`;
    //Displaying the UI :
    containerApp.style.opacity = '100';
    updateUI(currentAccount);
  } else {
    containerApp.style.opacity = '0';
    alert(
      'Something went wrong with the username or the password, please try again.'
    );
  }

  inputLoginUsername.value = '';
  inputLoginPin.value = '';
  document.activeElement.blur();
});

btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = +inputTransferAmount.value;
  const receiver = accounts.find(acc => acc.username === inputTransferTo.value);

  if (
    amount > 0 &&
    currentAccount.balance >= amount &&
    receiver &&
    receiver?.username !== currentAccount.username
  ) {
    currentAccount.movements.push(-amount);
    receiver.movements.push(amount);

    currentAccount.movementsDates.push(new Date().toISOString());
    receiver.movementsDates.push(new Date().toISOString());

    updateUI(currentAccount);
    clearInterval(timer);
    timer = startLogOutTimer();
  } else {
    alert(`Please make sure of the following: 
  1] that you have the correct username
  2] that you have enough money for the transaction `);
  }

  inputTransferAmount.value = '';
  inputTransferTo.value = '';
});

//The bank grants a loan if there's at least 1 deposit with at least 10% of the requested loan amount
btnLoan.addEventListener('click', function (e) {
  e.preventDefault();
  const loanAmount = +inputLoanAmount.value;
  if (
    loanAmount &&
    loanAmount > 0 &&
    currentAccount.movements.some(mov => mov >= loanAmount * 0.1)
  ) {
    setTimeout(() => {
      currentAccount.movements.push(Math.floor(loanAmount));
      currentAccount.movementsDates.push(new Date().toISOString());
      updateUI(currentAccount);
      clearInterval(timer);
      timer = startLogOutTimer();
    }, 3000);
  } else {
    alert(
      `Please check that you have at least one deposit that is 10% of the loan amount requested or else you won't be granted the loan.`
    );
  }

  inputLoanAmount.value = '';
});

btnSort.addEventListener('click', function () {
  showMovements(currentAccount, !sorted);
  sorted = !sorted;
});

btnClose.addEventListener('click', function (e) {
  e.preventDefault();

  if (
    inputCloseUsername.value === currentAccount.username &&
    +inputClosePin.value === currentAccount.pin
  ) {
    const accountToDeleteIndex = accounts.findIndex(
      acc =>
        acc.username === currentAccount.username &&
        acc.pin === currentAccount.pin
    );
    accounts.splice(accountToDeleteIndex, 1);
    labelWelcome.textContent = 'Log in to get started';
    containerApp.style.opacity = '0';
  } else {
    alert(`Please make sure you've got the correct username and pin number.`);
  }

  inputCloseUsername.value = inputClosePin.value = '';
});
