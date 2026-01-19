
# Структура базы данных PostgreSQL

Этот файл содержит актуальную схему базы данных для проекта CCM Dashboard.

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

## 3. Таблица: `app_dictionaries` (Единый справочник)
Универсальная таблица для всех справочников системы. Заменяет разрозненные таблицы (`available_regions`, `available_clients`, `city_ids` и т.д.).

| Поле | Тип | Комментарий |
|---|---|---|
| **id** | `serial` | PK |
| **category** | `varchar(50)` | Категория записи (ключ группировки) |
| **value** | `text` | Текстовое значение (Название) |
| **code** | `integer` | Числовой код (опционально, для технических связей, например ID города) |
| **sort_order** | `integer` | Порядок сортировки (по умолчанию 0) |
| **is_active** | `boolean` | Флаг активности (по умолчанию true) |
| **created_at** | `timestamp` | Дата создания |

### Категории данных (`category`):

1.  **region**: Регионы (Ставропольский край, Краснодарский край...)
2.  **client**: Заказчики (ЮСИ, ССК...)
3.  **year**: Отчетные годы (2024, 2025...)
4.  **object_type**: Типы объектов (ЖК, Административный...)
5.  **jk**: Жилые комплексы (Печерин, Моне, Усадьба...)
6.  **city_base_index**: Города с базовыми индексами для генерации ID договоров.
    *   *Пример:* Кисловодск (`code`: 1001), Анапа (`code`: 2001).

---

## 4. Таблица: `contract_transactions`
Таблица для хранения детализированных транзакций и истории изменений показателей по договорам. Позволяет отслеживать динамику поступлений и расходов во времени («развернутая» версия `data_contracts`).

| Поле | Тип | Комментарий |
|---|---|---|
| **id** | `serial` | PK, Auto-increment |
| **contract_id** | `numeric` | ID договора (связь с `data_contracts.contract_id`) |
| **type** | `varchar(255)` | Тип записи (ключ метрики, например `income_total_fact`, `expense_equip_plan`) |
| **value** | `numeric(15,2)` | Сумма транзакции |
| **text** | `text` | Комментарий или описание назначения платежа |
| **date** | `date` | Дата транзакции (обычно устанавливается на 1-е число года/месяца) |
| **date_created** | `timestamp` | Дата создания записи `[now()]` |
| **date_updated** | `timestamp` | Дата последнего обновления `[now()]` |
