**Script tạo bảng Dashboard theo kỳ:**



USE \[HotelManagementDB]   **// chú ý thay đổi theo tên database và kiểm tra các tên bang nghiệp vụ chính xác**

GO



SET ANSI\_NULLS ON

GO



SET QUOTED\_IDENTIFIER ON

GO



IF OBJECT\_ID(N'\[dbo].\[Role\_Dashboard\_Period\_States]', N'U') IS NOT NULL

BEGIN

&#x20;   PRINT N'Bảng \[dbo].\[Role\_Dashboard\_Period\_States] đã tồn tại. Không tạo lại.';

END

ELSE

BEGIN

&#x20;   CREATE TABLE \[dbo].\[Role\_Dashboard\_Period\_States]

&#x20;   (

&#x20;       \[id] \[int] IDENTITY(1,1) NOT NULL,



&#x20;       \[role\_id] \[int] NOT NULL,

&#x20;       \[role\_name] \[nvarchar](100) NOT NULL,



&#x20;       \[dashboard\_code] \[varchar](100) NOT NULL,

&#x20;       \[dashboard\_title] \[nvarchar](255) NOT NULL,



&#x20;       \[period\_type] \[varchar](20) NOT NULL,

&#x20;       \[period\_key] \[varchar](30) NOT NULL,



&#x20;       \[period\_start] \[datetime2](7) NOT NULL,

&#x20;       \[period\_end] \[datetime2](7) NOT NULL,



&#x20;       \[dashboard\_json] \[nvarchar](max) NOT NULL,

&#x20;       \[comparison\_json] \[nvarchar](max) NULL,



&#x20;       \[status] \[varchar](20) NOT NULL

&#x20;           CONSTRAINT \[DF\_RoleDashboardPeriod\_Status] DEFAULT ('OPEN'),



&#x20;       \[is\_current] \[bit] NOT NULL

&#x20;           CONSTRAINT \[DF\_RoleDashboardPeriod\_IsCurrent] DEFAULT ((0)),



&#x20;       \[last\_event\_type] \[varchar](100) NULL,

&#x20;       \[last\_event\_source] \[varchar](100) NULL,

&#x20;       \[last\_event\_ref\_id] \[int] NULL,



&#x20;       \[version] \[int] NOT NULL

&#x20;           CONSTRAINT \[DF\_RoleDashboardPeriod\_Version] DEFAULT ((1)),



&#x20;       \[created\_at] \[datetime2](7) NOT NULL

&#x20;           CONSTRAINT \[DF\_RoleDashboardPeriod\_CreatedAt] DEFAULT (SYSUTCDATETIME()),



&#x20;       \[updated\_at] \[datetime2](7) NOT NULL

&#x20;           CONSTRAINT \[DF\_RoleDashboardPeriod\_UpdatedAt] DEFAULT (SYSUTCDATETIME()),



&#x20;       \[closed\_at] \[datetime2](7) NULL,



&#x20;       \[updated\_by] \[int] NULL,



&#x20;       CONSTRAINT \[PK\_Role\_Dashboard\_Period\_States]

&#x20;           PRIMARY KEY CLUSTERED (\[id] ASC),



&#x20;       CONSTRAINT \[FK\_RoleDashboardPeriod\_Roles]

&#x20;           FOREIGN KEY (\[role\_id])

&#x20;           REFERENCES \[dbo].\[Roles](\[id]),



&#x20;       CONSTRAINT \[FK\_RoleDashboardPeriod\_UpdatedBy]

&#x20;           FOREIGN KEY (\[updated\_by])

&#x20;           REFERENCES \[dbo].\[Users](\[id]),



&#x20;       CONSTRAINT \[CK\_RoleDashboardPeriod\_PeriodType]

&#x20;           CHECK (\[period\_type] IN ('DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY')),



&#x20;       CONSTRAINT \[CK\_RoleDashboardPeriod\_Status]

&#x20;           CHECK (\[status] IN ('OPEN', 'CLOSED', 'REBUILT', 'CORRECTED')),



&#x20;       CONSTRAINT \[CK\_RoleDashboardPeriod\_DashboardJson\_IsJson]

&#x20;           CHECK (ISJSON(\[dashboard\_json]) = 1),



&#x20;       CONSTRAINT \[CK\_RoleDashboardPeriod\_ComparisonJson\_IsJson]

&#x20;           CHECK (\[comparison\_json] IS NULL OR ISJSON(\[comparison\_json]) = 1)

&#x20;   );



&#x20;   PRINT N'Đã tạo bảng \[dbo].\[Role\_Dashboard\_Period\_States].';

END

GO



**//Script tạo Index - Chạy sau khi tạo bảng thành công:**

USE \[HotelManagementDB]

GO



IF NOT EXISTS (

&#x20;   SELECT 1

&#x20;   FROM sys.indexes

&#x20;   WHERE name = N'UX\_RoleDashboardPeriod\_Role\_Dashboard\_Period'

&#x20;     AND object\_id = OBJECT\_ID(N'\[dbo].\[Role\_Dashboard\_Period\_States]')

)

BEGIN

&#x20;   CREATE UNIQUE INDEX \[UX\_RoleDashboardPeriod\_Role\_Dashboard\_Period]

&#x20;   ON \[dbo].\[Role\_Dashboard\_Period\_States]

&#x20;   (

&#x20;       \[role\_id],

&#x20;       \[dashboard\_code],

&#x20;       \[period\_type],

&#x20;       \[period\_key]

&#x20;   );

END

GO



IF NOT EXISTS (

&#x20;   SELECT 1

&#x20;   FROM sys.indexes

&#x20;   WHERE name = N'IX\_RoleDashboardPeriod\_Query'

&#x20;     AND object\_id = OBJECT\_ID(N'\[dbo].\[Role\_Dashboard\_Period\_States]')

)

BEGIN

&#x20;   CREATE INDEX \[IX\_RoleDashboardPeriod\_Query]

&#x20;   ON \[dbo].\[Role\_Dashboard\_Period\_States]

&#x20;   (

&#x20;       \[dashboard\_code],

&#x20;       \[role\_name],

&#x20;       \[period\_type],

&#x20;       \[period\_start],

&#x20;       \[period\_end]

&#x20;   );

END

GO



IF NOT EXISTS (

&#x20;   SELECT 1

&#x20;   FROM sys.indexes

&#x20;   WHERE name = N'IX\_RoleDashboardPeriod\_Current'

&#x20;     AND object\_id = OBJECT\_ID(N'\[dbo].\[Role\_Dashboard\_Period\_States]')

)

BEGIN

&#x20;   CREATE INDEX \[IX\_RoleDashboardPeriod\_Current]

&#x20;   ON \[dbo].\[Role\_Dashboard\_Period\_States]

&#x20;   (

&#x20;       \[role\_id],

&#x20;       \[dashboard\_code],

&#x20;       \[period\_type],

&#x20;       \[is\_current]

&#x20;   )

&#x20;   WHERE \[is\_current] = 1;

END

GO



IF NOT EXISTS (

&#x20;   SELECT 1

&#x20;   FROM sys.indexes

&#x20;   WHERE name = N'IX\_RoleDashboardPeriod\_UpdatedAt'

&#x20;     AND object\_id = OBJECT\_ID(N'\[dbo].\[Role\_Dashboard\_Period\_States]')

)

BEGIN

&#x20;   CREATE INDEX \[IX\_RoleDashboardPeriod\_UpdatedAt]

&#x20;   ON \[dbo].\[Role\_Dashboard\_Period\_States]

&#x20;   (

&#x20;       \[updated\_at] DESC

&#x20;   );

END

GO



**//Script seed dữ liệu dashboard mẫu theo Roles**



USE \[HotelManagementDB]

GO



DECLARE @PeriodType VARCHAR(20) = 'MONTHLY';

DECLARE @PeriodKey VARCHAR(30) = FORMAT(GETDATE(), 'yyyy-MM');

DECLARE @PeriodStart DATETIME2(7) = DATEFROMPARTS(YEAR(GETDATE()), MONTH(GETDATE()), 1);

DECLARE @PeriodEnd DATETIME2(7) = DATEADD(SECOND, -1, DATEADD(MONTH, 1, @PeriodStart));



INSERT INTO \[dbo].\[Role\_Dashboard\_Period\_States]

(

&#x20;   \[role\_id],

&#x20;   \[role\_name],

&#x20;   \[dashboard\_code],

&#x20;   \[dashboard\_title],

&#x20;   \[period\_type],

&#x20;   \[period\_key],

&#x20;   \[period\_start],

&#x20;   \[period\_end],

&#x20;   \[dashboard\_json],

&#x20;   \[comparison\_json],

&#x20;   \[status],

&#x20;   \[is\_current]

)

SELECT

&#x20;   r.\[id] AS \[role\_id],

&#x20;   r.\[name] AS \[role\_name],



&#x20;   CASE r.\[name]

&#x20;       WHEN N'Admin' THEN 'ADMIN\_DASHBOARD'

&#x20;       WHEN N'Manager' THEN 'MANAGER\_DASHBOARD'

&#x20;       WHEN N'Receptionist' THEN 'RECEPTION\_DASHBOARD'

&#x20;       WHEN N'Accountant' THEN 'ACCOUNTANT\_DASHBOARD'

&#x20;       WHEN N'Housekeeping' THEN 'HOUSEKEEPING\_DASHBOARD'

&#x20;       WHEN N'Security' THEN 'SECURITY\_DASHBOARD'

&#x20;       WHEN N'Chef' THEN 'CHEF\_DASHBOARD'

&#x20;       WHEN N'Waiter' THEN 'WAITER\_DASHBOARD'

&#x20;       WHEN N'IT Support' THEN 'IT\_SUPPORT\_DASHBOARD'

&#x20;       WHEN N'Guest' THEN 'GUEST\_DASHBOARD'

&#x20;       ELSE UPPER(REPLACE(CONVERT(VARCHAR(100), r.\[name]), ' ', '\_')) + '\_DASHBOARD'

&#x20;   END AS \[dashboard\_code],



&#x20;   r.\[name] + N' Dashboard' AS \[dashboard\_title],



&#x20;   @PeriodType AS \[period\_type],

&#x20;   @PeriodKey AS \[period\_key],

&#x20;   @PeriodStart AS \[period\_start],

&#x20;   @PeriodEnd AS \[period\_end],



&#x20;   N'{

&#x20;       "meta": {

&#x20;           "schemaVersion": 1,

&#x20;           "dashboardCode": "",

&#x20;           "roleName": "",

&#x20;           "periodType": "MONTHLY",

&#x20;           "periodKey": "",

&#x20;           "status": "OPEN"

&#x20;       },

&#x20;       "summary": {},

&#x20;       "widgets": {},

&#x20;       "breakdown": {},

&#x20;       "alerts": \[],

&#x20;       "events": \[]

&#x20;   }' AS \[dashboard\_json],



&#x20;   N'{

&#x20;       "base": {

&#x20;           "comparisonType": "PREVIOUS\_PERIOD"

&#x20;       },

&#x20;       "metrics": {}

&#x20;   }' AS \[comparison\_json],



&#x20;   'OPEN' AS \[status],

&#x20;   1 AS \[is\_current]

FROM \[dbo].\[Roles] r

WHERE NOT EXISTS

(

&#x20;   SELECT 1

&#x20;   FROM \[dbo].\[Role\_Dashboard\_Period\_States] d

&#x20;   WHERE d.\[role\_id] = r.\[id]

&#x20;     AND d.\[period\_type] = @PeriodType

&#x20;     AND d.\[period\_key] = @PeriodKey

&#x20;     AND d.\[dashboard\_code] =

&#x20;       CASE r.\[name]

&#x20;           WHEN N'Admin' THEN 'ADMIN\_DASHBOARD'

&#x20;           WHEN N'Manager' THEN 'MANAGER\_DASHBOARD'

&#x20;           WHEN N'Receptionist' THEN 'RECEPTION\_DASHBOARD'

&#x20;           WHEN N'Accountant' THEN 'ACCOUNTANT\_DASHBOARD'

&#x20;           WHEN N'Housekeeping' THEN 'HOUSEKEEPING\_DASHBOARD'

&#x20;           WHEN N'Security' THEN 'SECURITY\_DASHBOARD'

&#x20;           WHEN N'Chef' THEN 'CHEF\_DASHBOARD'

&#x20;           WHEN N'Waiter' THEN 'WAITER\_DASHBOARD'

&#x20;           WHEN N'IT Support' THEN 'IT\_SUPPORT\_DASHBOARD'

&#x20;           WHEN N'Guest' THEN 'GUEST\_DASHBOARD'

&#x20;           ELSE UPPER(REPLACE(CONVERT(VARCHAR(100), r.\[name]), ' ', '\_')) + '\_DASHBOARD'

&#x20;       END

);

GO



