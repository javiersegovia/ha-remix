CREATE TABLE Persons (
    PersonID SERIAL NOT NULL,
    LastName varchar(255),
    FirstName varchar(255),
    Address varchar(255),
    City varchar(255),

    CONSTRAINT "Persons_pkey" PRIMARY KEY (PersonID)
);

CREATE TABLE PersonOrders (
    OrderID SERIAL NOT NULL,
    OrderNumber INT NOT NULL,
    PersonID INT,

    PRIMARY KEY (OrderID),
    FOREIGN KEY (PersonID) REFERENCES Persons(PersonID)
);
