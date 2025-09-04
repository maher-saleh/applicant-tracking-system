SET @user_id = 1;
SET @column_value = 'backlog';

-- 1. A query to **retrieve tasks** for a specific user and column
SELECT * 
FROM tasks 
WHERE user_id = @user_id 
  AND `column` = @column_value;

-- 2. A query to **count tasks in each column**
SELECT `column`, COUNT(*) AS count 
FROM tasks 
WHERE user_id = @user_id 
GROUP BY `column`;

-- 3. A query to **list all tasks with related user/column info** using JOINs
SELECT tasks.*, users.name AS user_name 
FROM tasks 
JOIN users ON tasks.user_id = users.id
WHERE tasks.user_id = @user_id;