# Interactive class diagram

Visualization of the role-stereotypes and dependencies of the K9 Mail application. Created during the TU/e SET-seminar 2020-2021.

## Usage

Open main.html with your favorite browser. Use the role toggles in the sidebar to show/hide classes and dependencies to classes with the role. Click on a package to collapse/expand it. When dependencies are aggregated, use the dependecie threshold slider to only show dependencie lines that represent at least that amount of dependencies.

### Importing your own dataset

Provide two csv files:
- csv of classes with the following headers:
    - Index - used to refer to the class in the dependencies file
    - Dot_file_ext – a dot separated path of the location of the class in the file system
    - Classname – the name of the class
    - Label – the role-stereotype of the class
    - Classtype – either enum, class, abstract class or interface
- csv of a dependency matrix where each value at row X and column Y represents the relationship between the classes with index X and Y, this file should not contain headers:
    - Value 0: no relationship between class X and Y
    - Value 1: class X depends on class Y
    - Value 2: class X is a sub class of class Y
    - Value 3: class X implements Y

See new_version_..._20180726.csv.js files for an example of each file.
