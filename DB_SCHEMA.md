
# Структура базы данных PostgreSQL

Актуальная схема базы данных проекта CCM Dashboard.

---

## 1. Таблица: `app_dictionaries`
Справочники приложения (регионы, клиенты, типы объектов и т.д.).

| Поле | Тип | Комментарий / Default |
|---|---|---|
| **id** | `integer` | **PK**, Auto-increment `[nextval('app_dictionaries_id_seq')]` |
| **category** | `character varying(50)` | Категория справочника (INDEX) |
| **value** | `text` | Значение |
| **code** | `integer` | NULL |
| **sort_order** | `integer` | NULL `[0]` |
| **is_active** | `boolean` | NULL `[true]` |
| **created_at** | `timestamp` | NULL `[now()]` |

### Индексы
*   **PRIMARY KEY**: `id`
*   **INDEX**: `category`

---

## 2. Таблица: `contract_transactions`
Детализированные транзакции по договорам (финансовые операции, изменения статусов и т.д.).

| Поле | Тип | Комментарий / Default |
|---|---|---|
| **id** | `integer` | **PK**, Auto-increment `[nextval('contract_transactions_id_seq')]` |
| **contract_id** | `numeric` | ID договора (INDEX) |
| **type** | `character varying(255)` | Тип транзакции (INDEX) |
| **value** | `numeric(15,2)` | Сумма / Значение |
| **text** | `text` | Описание (NULL) |
| **date** | `date` | Дата транзакции (INDEX) |
| **created_at** | `timestamp` | NULL `[now()]` |
| **updated_at** | `timestamp` | NULL `[now()]` |
| **created_by** | `character varying(255)` | NULL |
| **updated_by** | `character varying(255)` | NULL |

### Индексы
*   **PRIMARY KEY**: `id`
*   **INDEX**: `contract_id`
*   **INDEX**: `type`
*   **INDEX**: `date`

### Триггеры
1.  **trg_calc_financials** (`AFTER DELETE OR INSERT OR UPDATE`): Пересчет финансовых итогов в родительской таблице.
2.  **update_contract_transactions_modtime** (`BEFORE UPDATE`): Автоматическое обновление поля `updated_at`.

---

## 3. Таблица: `data_contracts`
Основная таблица договоров и литеров (объектов).

| Поле | Тип | Комментарий / Default |
|---|---|---|
| **id** | `integer` | **PK**, Auto-increment `[nextval('data_contracts_id_seq')]` |
| **city** | `character varying(255)` | Город (NULL) |
| **housing_complex** | `character varying(255)` | ЖК (NULL) |
| **liter** | `character varying(255)` | Литер (NULL) |
| **is_handed_over** | `boolean` | Сдан да/нет (NULL) |
| **region** | `character varying(255)` | Регион (NULL) |
| **no_liter_breakdown** | `boolean` | Без разбивки на литеры (NULL) |
| **is_separate_liter** | `boolean` | Отдельный литер (NULL) |
| **object_type** | `character varying(255)` | Тип объекта (NULL) |
| **client_name** | `character varying(255)` | Клиент (NULL) |
| **year** | `integer` | Год (NULL) |
| **elevators_count** | `integer` | Кол-во лифтов (NULL) |
| **floors_count** | `integer` | Кол-во этажей (NULL) |
| **income_equip_plan** | `numeric(15,2)` | Доходы Обор. План `[0]` |
| **income_equip_fact** | `numeric(15,2)` | Доходы Обор. Факт `[0]` |
| **expense_equip_plan** | `numeric(15,2)` | Расходы Обор. План `[0]` |
| **expense_equip_fact** | `numeric(15,2)` | Расходы Обор. Факт `[0]` |
| **income_frame_plan** | `numeric(15,2)` | Доходы Обрамл. План `[0]` |
| **income_frame_fact** | `numeric(15,2)` | Доходы Обрамл. Факт `[0]` |
| **expense_frame_plan** | `numeric(15,2)` | Расходы Обрамл. План `[0]` |
| **expense_frame_fact** | `numeric(15,2)` | Расходы Обрамл. Факт `[0]` |
| **income_install_plan** | `numeric(15,2)` | Доходы Монтаж План `[0]` |
| **income_install_fact** | `numeric(15,2)` | Доходы Монтаж Факт `[0]` |
| **expense_install_plan** | `numeric(15,2)` | Расходы Монтаж План `[0]` |
| **expense_install_fact** | `numeric(15,2)` | Расходы Монтаж Факт `[0]` |
| **income_add_plan** | `numeric(15,2)` | Доходы Доп. План `[0]` |
| **income_add_fact** | `numeric(15,2)` | Доходы Доп. Факт `[0]` |
| **expense_add_plan** | `numeric(15,2)` | Расходы Доп. План `[0]` |
| **expense_add_fact** | `numeric(15,2)` | Расходы Доп. Факт `[0]` |
| **income_total_plan** | `numeric(15,2)` | Итого Доходы План `[0]` |
| **income_total_fact** | `numeric(15,2)` | Итого Доходы Факт `[0]` |
| **expense_total_plan** | `numeric(15,2)` | Итого Расходы План `[0]` |
| **expense_total_fact** | `numeric(15,2)` | Итого Расходы Факт `[0]` |
| **gross_profit** | `numeric(15,2)` | Валовая прибыль `[0]` |
| **contract_id** | `numeric` | ID контракта (NULL) |
| **created_at** | `timestamp` | NULL `[now()]` |
| **rentability_calculated** | `numeric(5,2)` | Generated: `WHEN ((no_liter_breakdown = true) AND (income_total_fact > 0)) THEN ((gross_profit / income_total_fact) * 100)` |
| **profit_per_lift_calculated** | `numeric(15,2)` | Generated: `WHEN (elevators_count > 0) THEN (gross_profit / elevators_count)` |
| **updated_at** | `timestamp` | NULL `[now()]` |
| **created_by** | `character varying(255)` | NULL |
| **updated_by** | `character varying(255)` | NULL |

### Индексы
*   **PRIMARY KEY**: `id`

### Триггеры
1.  **update_data_contracts_modtime** (`BEFORE UPDATE`): Автоматическое обновление поля `updated_at`.

---

## 4. Таблица: `meta_dictionary`
Маппинг полей базы данных с заголовками Google Sheets.

| Поле | Тип | Комментарий / Default |
|---|---|---|
| **id** | `integer` | **PK**, Auto-increment `[nextval('meta_dictionary_id_seq')]` |
| **db_column** | `character varying(255)` | Имя колонки в БД |
| **sheet_header** | `text` | Заголовок в таблице |
| **ui_label** | `character varying(255)` | Название в интерфейсе (NULL) |
| **data_type** | `character varying(255)` | Тип данных (NULL) |

### Индексы
*   **PRIMARY KEY**: `id`
