# KharchaBook

A bilingual (English & Hindi) personal expense, daily safe-spend, and Udhaar (split/IOU) tracker built with Expo Router and React Native.

## Features

- **Home & Daily Ledger**: Monthly budget progress bar, dynamic Daily Safe Spend limit, month-by-month switcher, search, payment mode & category filters, and day-grouped transactions.
- **Fast Expense Entry & Editing**: Tap `+` or any transaction to add/edit amounts, increment with quick `+₹20 / +₹50 / +₹100 / +₹200 / +₹500` chips, pick dates (`Today`, `Yesterday`, `2 days ago`, or stepper), and use 1-tap category note tags.
- **Udhaar & Split Book**: Track money lent (`To Receive`) and borrowed (`To Pay`), net balance overview, Pending/Settled filters, search, and 1-tap payment reminders.
- **Visual Analytics**: SVG Donut chart for category breakdown, 7-day spending bar chart, month-over-month comparison, average daily spend, and payment mode split.
- **Profile, Export & Backup**: Bilingual toggle (`English` / `हिंदी`), CSV export for Expenses and Udhaar, JSON backup/restore, and one-tap sample data loader.

## Running Locally

```bash
npm install
npx expo start
```

For Android USB debugging:

```bash
adb reverse tcp:8081 tcp:8081 && npx expo start --localhost --android
```
