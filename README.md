# Sistema de Gestión Bibliotecaria

If you're looking for the Spanish version of this README.md file, look at 
README - Spanish.md

DISCLAIMER: This app was developed for educational purposes, and its not 
meant to be a production-ready. 

'Sistema de Gestión Bibliotecaria', which translates to 'Library Management
System', is a project developed to learn how to use the following technology
stack:
- NextJS 
- NextAuth
- Prisma
- SupaBase

As well as using the following libraries:
- Formik
- Yup
- jsPDF
- NodeMailer

# Objectives
The app is meant to be a representation of a system that should help a fictional
library to better manage itself. Originally this was a project I did in school, 
but the previous version was much more reduced in actual functionality (e.g. it 
lacked authentication). This version was thus developed to see what a more 
complete version of the project would look like. 

# Architecture Summary
The application is built with NextJS, which provides the required 
FrontEnd and BackEnd functionality for the application. Prisma is being used as
an adapter to communicate, through NextAuth, with SupaBase, which is where a 
PostgreSQL database is used, as well as a bucket to store files. 

# Feature Showcase
## Login Screen
The user can log in with their Gmail Account, or a NextAuth email link can be 
sent to the email they provide. These links are valid for 10 minutes. 
![LoginScreen](https://github.com/Alan-Rodz/SGBReact/blob/main/img/loginScreen.png)

# Application Schema
NOTE: Entities that are not discussed below are related to NextAuth, and 
explanations about them can be found at https://next-auth.js.org/adapters/prisma

## User / Employee
Employees are meant to be the users of the application. They are categorized in 3 
levels: Administrator, Secretary and Employee (the last one being category with 
the least authority). The Employee Level of an Employee determines which operations 
they can perform through the application. Since Users also have an authed state and
can log in / log out, they are represented in the 
Prisma Schema through the User entity.

## Author
Authors refer to the individuals who write the books that the fictional library is
meant to sell. The schema is limited to one Author per book, and the only 
information saved about them is their name.

## Book
Books are self descriptive. Information about their genre, release date, author and
author is saved. 

## BookCopy
A BookCopy represents a certain version of a Book. Since these copies can have 
differences among them (e.g. a certain edition of a Book being more expensive than
other versions), information about it such as the specific amount of pages it has,
its price, and how many copies of it does the fictional library currently have is 
saved.

## LibraryUser
A LibraryUser is meant to represent an individual who frequently goes into the 
fictional library to read books. This individual can acquire a membership that 
allows it to enjoy certain benefits (book lending management and related concerns
are outside the scope of the application). Information about the name and the email
of the LibraryUser is kept.

## MembershipPrice
Membership Prices can vary throughout time and they can be modified by any Employee
whose Employee Level is that of an Administrator. They can only be set, (i.e. once
set a Membership price can only be replaced by another one, going forever into
the database).

## Sale
Sales can be made for either a Membership for the Library, which creates a 
LibraryUser, or for Books. In either case, information about the date the sale was 
made, the total price, the Employee who made the sale, and the route of the PDF
file that gets created when the sale is performed is kept. 

## TaxRate
TaxRates are meant to represent the Tax that gets applied to a certain Sale. Just
like Membership prices, they can vary through time, and they can be modified by
Administrator Employees. They have the same limitations that Membership prices do.
