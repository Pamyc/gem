
# Структура базы данных PostgreSQL

Этот файл содержит актуальную схему базы данных для проекта CCM Dashboard.
Используется как контекст для ИИ-агента.

---

## 1. Таблица: `data_contracts`
Основная таблица для хранения финансовых и количественных показателей по договорам/лифтам.

| Поле | Тип | Комментарий / Логика |
|---|---|---|
| **id** | `integer` | PK, Auto-increment `[nextval('data_contracts_id_seq')]` |
| **city** | `varchar(255)` | Город |
| **housing_complex** | `varchar(255)` | Жилой комплекс (ЖК) |
| **liter** | `varchar(255)` | Литер |
| **is_handed_over** | `boolean` | Статус сдачи (Сдан да/нет) |
| **region** | `varchar(255)` | Регион |
| **is_total** | `boolean` | Флаг строки "Итого" |
| **no_liter_breakdown** | `boolean` | Флаг "Без разбивки на литеры" (агрегированная строка по ЖК) |
| **is_separate_liter** | `boolean` | Флаг "Отдельный литер" |
| **object_type** | `varchar(255)` | Тип объекта (Жилье, Школа, ТЦ и т.д.) |
| **client_name** | `varchar(255)` | Имя клиента/заказчика |
| **year** | `integer` | Год |
| **elevators_count** | `integer` | Кол-во лифтов |
| **floors_count** | `integer` | Кол-во этажей |
| **income_total_plan** | `numeric(15,2)` | Доходы (План) - Общий |
| **income_total_fact** | `numeric(15,2)` | Доходы (Факт) - Общий |
| **income_equip_plan** | `numeric(15,2)` | Доходы: Лифтовое оборудование (План) |
| **income_equip_fact** | `numeric(15,2)` | Доходы: Лифтовое оборудование (Факт) |
| **income_frame_plan** | `numeric(15,2)` | Доходы: Обрамление (План) |
| **income_frame_fact** | `numeric(15,2)` | Доходы: Обрамление (Факт) |
| **income_install_plan** | `numeric(15,2)` | Доходы: Монтаж ЛО (План) |
| **income_install_fact** | `numeric(15,2)` | Доходы: Монтаж ЛО (Факт) |
| **expense_total_plan** | `numeric(15,2)` | Расходы (План) - Общий |
| **expense_total_fact** | `numeric(15,2)` | Расходы (Факт) - Общий |
| **expense_equip_plan** | `numeric(15,2)` | Расходы: Оборудование (План) |
| **expense_equip_fact** | `numeric(15,2)` | Расходы: Оборудование (Факт) |
| **expense_frame_plan** | `numeric(15,2)` | Расходы: Обрамление (План) |
| **expense_frame_fact** | `numeric(15,2)` | Расходы: Обрамление (Факт) |
| **expense_install_plan** | `numeric(15,2)` | Расходы: Монтаж (План) |
| **expense_install_fact** | `numeric(15,2)` | Расходы: Монтаж (Факт) |
| **expense_fot_fact** | `numeric(15,2)` | Расходы: ФОТ (Факт) |
| **gross_profit** | `numeric(15,2)` | Валовая прибыль |
| **created_at** | `timestamp` | Дата создания записи `[now()]` |
| **contract_id** | `numeric` | ID договора (внешний ключ или ссылка) |
| **rentability_calculated** | `numeric(5,2)` | *Generated Column*: Рентабельность %<br>`CASE WHEN ((no_liter_breakdown = true) AND (income_total_fact > 0)) THEN ((gross_profit / income_total_fact) * 100) END` |
| **profit_per_lift_calculated** | `numeric(15,2)` | *Generated Column*: Прибыль на 1 лифт<br>`CASE WHEN (elevators_count > 0) THEN (gross_profit / elevators_count) END` |

---

## 2. Таблица: `meta_dictionary`
Служебная таблица для маппинга (сопоставления) заголовков из Google Sheets/Excel с колонками базы данных.

| Поле | Тип | Комментарий |
|---|---|---|
| **id** | `integer` | PK, Auto-increment `[nextval('meta_dictionary_id_seq')]` |
| **db_column** | `varchar(255)` | Название колонки в таблице `data_contracts` |
| **sheet_header** | `text` | Точное название заголовка в исходном файле (Google Sheet) |
| **ui_label** | `varchar(255)` | Человекочитаемое название для интерфейса (Label) |
| **data_type** | `varchar(255)` | Тип данных для парсинга (`int`, `float`, `string`, `bool`) |

---

## 3. Таблица: `ui_settings`
Таблица для хранения пользовательских настроек интерфейса (например, порядок столбцов, сохраненные фильтры и т.д.).

| Поле | Тип | Комментарий |
|---|---|---|
| **id** | `integer` | PK, Auto-increment `[nextval('ui_settings_new_id_seq')]` |
| **setting_key** | `varchar(255)` | Уникальный ключ настройки (например, `table_order_main`) |
| **setting_value** | `text` | Значение настройки (обычно JSON строка) |

