# ScientificWork

Данный репозиторий содержит в себе исходный код игрового веб-приложения "Logic game in circuit". Проект находится в разработке. На данный момент реализован следующий функционал:

##	Игровая часть приложения
* Генерирование игрового поля на первые 30 уровней. 
* Колличество переменных устанавливается в зависимости от текущего уровня
* Сгенерированная формула визуализируется в види блоков
* Возможность изменять значение входных параметров логической схемы. 
* В зависимости от заданного значеия сигналов изменяется цвет блоков. Если истинно - зеленый, ложно - оранжевый.

##	Минимизация сгенерированной или заданной формулы
* Минимизация сгенерированной или заданной пользователем(путем заполнения таблицы) формулы до 4 переменных включительно.
* Реализована визуализация с подсветкой дизъюнктов минимизированной формулы и соответствия их на Карте Карно.

##	Справка по основным функциям алгебры логики и алгоритму минимизации
* Добавлен вывод краткой информацией с таблицей истинности о каждой из использующихся в проекте функций(and, or, xor, nan, nor, not)
* Планируется добавить вывод соответствующего логической функции вентеля.


Сборка проекта осуществляется сборщиком gulp и bower. Необходимые пакеты включены в файлы gulpfile.js и bower.json - для запуска проекта нужно выполнить инициализацию приложения и загрузить необходимые пакеты с помощью gulp.
