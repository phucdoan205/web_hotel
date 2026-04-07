UPDATE Users SET membership_id = NULL;
DELETE FROM Memberships;
DBCC CHECKIDENT ('Memberships', RESEED, 0);

INSERT INTO Memberships (tier_name, min_points, discount_percent) VALUES
(N'Đồng', 2000000, 5),
(N'Bạc', 10000000, 10),
(N'Vàng', 25000000, 15),
(N'Kim Cương', 50000000, 20);

GO
