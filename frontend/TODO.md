Порядок миграции компонентов на дизайн-систему

# ui — базовые, без зависимостей друг от друга

1.  [x] ui/Spinner.tsx
2.  [x] ui/CheckBox.tsx
3.  [x] ui/CopyButton.tsx
4.  [x] ui/ToggleCard.tsx
5.  [x] ui/ModalActions.tsx
6.  [x] ui/Card.tsx
7.  [x] ui/Modal.tsx — зависит от Card
8.  [x] ui/DropDownMenu.tsx
9.  [x] ui/FormInput.tsx — зависит от FormLabel

# common — используют ui-компоненты

10. [x] common/ProgressBar.tsx
11. [x] common/StatusBadge.tsx
12. [x] common/Toaster.tsx
13. [x] common/NotifyBanner.tsx
14. [x] common/ServerSelector.tsx
15. [x] common/ConnectionCard.tsx
16. [x] common/Avatars.tsx
17. [x] common/Guide.tsx

# layout

18. [x] layout/BottomBar.tsx
19. [x] layout/AppShell.tsx — зависит от BottomBar

# feature-компоненты — используют ui + common

20. dashboard/KpiCard.tsx
21. dashboard/SectionCard.tsx
22. users/UserRow.tsx
23. users/UserTableToolbar.tsx
24. users/UserTable.tsx — зависит от UserRow
25. users/UserCreateForm.tsx
26. users/UserEditForm.tsx
27. users/UserViewModal.tsx
28. servers/ServerRow.tsx
29. servers/ServerTable.tsx
30. servers/ServerCreateForm.tsx
31. servers/ServerEditForm.tsx

# pages — последними, зависят от всего остального

32. [x] pages/LoginPage.tsx
33. [x] pages/RegisterPage.tsx
34. [x] pages/ProfilePage.tsx
35. [x] pages/SettingsPage.tsx
36. pages/AdminBoard.tsx
37. pages/UsersPage.tsx
38. pages/ServersPage.tsx
39. [x] pages/ManualPage.tsx
40. [x] pages/ChekavoPage.tsx
41. [x] pages/NotFoundPage.tsx
