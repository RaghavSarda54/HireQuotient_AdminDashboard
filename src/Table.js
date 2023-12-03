import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPenToSquare,
  faSquareCheck,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { Pagination } from "@mui/material";

const UserDetailsTable = () => {
  const [selectedRows, setSelectedRows] = useState([]);
  const [users, setUsers] = useState([]);
  const [allChecked, setAllChecked] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredUsers, setFilteredUsers] = useState(users);
  const [currentUsers, setCurrentUsers] = useState(users);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          "https://geektrust.s3-ap-southeast-1.amazonaws.com/adminui-problem/members.json"
        );
        if (!response.ok) {
          throw new Error("Network response was not ok.");
        }
        const data = await response.json();
        setUsers(data);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const filtered = users.filter(
      (user) =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.role.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(filtered);
    setCurrentPage(1);
  }, [searchTerm, users]);

  const handleRowSelect = (id) => {
    const selectedIndex = selectedRows.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selectedRows, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selectedRows.slice(1));
    } else if (selectedIndex === selectedRows.length - 1) {
      newSelected = newSelected.concat(selectedRows.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selectedRows.slice(0, selectedIndex),
        selectedRows.slice(selectedIndex + 1)
      );
    }

    setSelectedRows(newSelected);
  };

  const deleteOneUser = (id) => {
    const updatedUsers = users.filter((user) => user.id !== id);
    setUsers(updatedUsers);
  };

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
    setAllChecked(false);
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1);
  };

  const handleEdit = (id) => {
    const updatedUsers = users.map((user) =>
      user.id === id ? { ...user, isEditing: true } : user
    );
    setUsers(updatedUsers);
  };

  const handleEditConfirmation = (id) => {
    const updatedUsers = users.map((user) =>
      user.id === id ? { ...user, isEditing: false } : user
    );
    setUsers(updatedUsers);
  };

  useEffect(() => {
    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const updatedCurrentUsers = filteredUsers.slice(
      indexOfFirstUser,
      indexOfLastUser
    );
    setCurrentUsers(updatedCurrentUsers);
  }, [currentPage, usersPerPage, filteredUsers]);

  const deleteUsers = () => {
    const updatedUsers = filteredUsers.filter(
      (user) => !selectedRows.includes(user.id)
    );
    setFilteredUsers(updatedUsers);
    setSelectedRows([]);

    const totalPages = Math.ceil(updatedUsers.length / usersPerPage);
    const newCurrentPage = Math.min(currentPage, totalPages);
    setCurrentPage(newCurrentPage);
    setAllChecked(false);
  };

  const handleMainCheckboxChange = () => {
    const allIds = currentUsers.map((user) => user.id);
    setAllChecked(!allChecked);

    if (allChecked) {
      setSelectedRows([]);
    } else {
      setSelectedRows(allIds);
    }
  };

  const handleEditUser = (id, field, value) => {
    const updatedUsers = users.map((user) =>
      user.id === id ? { ...user, [field]: value } : user
    );
    setUsers(updatedUsers);
  };

  return (
    <>
      <div className="flex pl-4 pr-8">
        <div className="Search-Icon mt-2 h-12 flex-grow">
          <input
            type="text"
            className="block w-64 h-12 mx-4 px-4 py-2 text-gray-700 bg-white border rounded-md focus:border-gray-400 focus:ring-gray-300 focus:outline-none focus:ring focus:ring-opacity-40"
            placeholder="Search..."
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>

        <div className="w-12 height-16 pt-2">
          <button
            className="w-12 h-12 bg-pink-300 hover:cursor-pointer rounded"
            onClick={deleteUsers}
            disabled={selectedRows.length === 0}
          >
            <FontAwesomeIcon
              icon={faTrash}
              style={{ color: "#ffffff" }}
              size="lg"
            />
          </button>
        </div>
      </div>
      <div className="container flex-col mx-auto pl-8 pr-8">
        <div className="bg-white shadow-md rounded-md mt-3 md-2">
          <table className="min-w-max w-full table-auto">
            <thead className="">
              <tr className="bg-gray-200 text-gray-600  text-sm leading-normal ">
                <th>
                  <input
                    type="checkbox"
                    className="w-5 h-5 hover:cursor-pointer"
                    onChange={handleMainCheckboxChange}
                    checked={allChecked}
                  />
                </th>
                <th className="py-3 px-6 text-left">Name</th>
                <th className="py-3 px-6 text-left">Email</th>
                <th className="py-3 px-6 text-left">Role</th>
                <th className="py-3 px-6 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="text-gray-600 text-sm font-light">
              {currentUsers.map((user) => (
                <tr
                  key={user.id}
                  className={`border-b border-gray-200 hover:bg-gray-100 ${
                    selectedRows.includes(user.id) ? "bg-gray-300" : ""
                  }`}
                >
                  <td>
                    <input
                      type="checkbox"
                      className="w-5 h-5 ml-8 border border-black rounded-md hover:cursor-pointer"
                      onChange={() => handleRowSelect(user.id)}
                      checked={selectedRows.includes(user.id)}
                    />
                  </td>

                  <td className="py-3 px-6 text-left whitespace-nowrap font-medium">
                    {user.isEditing ? (
                      <input
                        type="text"
                        value={user.name}
                        onChange={(e) =>
                          handleEditUser(user.id, "name", e.target.value)
                        }
                      />
                    ) : (
                      user.name
                    )}
                  </td>

                  <td className="py-3 px-6 text-left whitespace-nowrap font-medium">
                    {user.isEditing ? (
                      <input
                        type="text"
                        value={user.email}
                        onChange={(e) =>
                          handleEditUser(user.id, "email", e.target.value)
                        }
                      />
                    ) : (
                      user.email
                    )}
                  </td>
                  <td className="py-3 px-6 text-left whitespace-nowrap font-medium">
                    {user.isEditing ? (
                      <input
                        type="text"
                        value={user.role}
                        onChange={(e) =>
                          handleEditUser(user.id, "role", e.target.value)
                        }
                      />
                    ) : (
                      user.role
                    )}
                  </td>
                  <td className="py-3 px-6 text-left whitespace-nowrap">
                    <div className="flex gap-3 ">
                      {user.isEditing ? (
                        <button
                          className="Save flex items-center justify-center w-8 h-8 border border-gray-200 rounded-sm hover:cursor-pointer "
                          onClick={() => handleEditConfirmation(user.id)}
                        >
                          <FontAwesomeIcon
                            icon={faSquareCheck}
                            style={{ color: "green" }}
                            size="lg"
                          />
                        </button>
                      ) : (
                        <button
                          className="Edit flex items-center justify-center w-8 h-8 border border-gray-200 rounded-sm hover:cursor-pointer "
                          onClick={() => handleEdit(user.id)}
                        >
                          <FontAwesomeIcon icon={faPenToSquare} size="lg" />
                        </button>
                      )}
                      <button
                        className="Delete flex items-center justify-center w-8 h-8 border border-gray-200 rounded-sm hover:cursor-pointer"
                        onClick={() => deleteOneUser(user.id)}
                      >
                        <FontAwesomeIcon
                          icon={faTrash}
                          style={{ color: "red" }}
                          size="lg"
                        />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="pagination flex justify-center mt-3">
        <div>
          <Pagination
            count={Math.ceil(filteredUsers.length / usersPerPage)}
            page={currentPage}
            onChange={handlePageChange}
            boundaryCount={2}
            siblingCount={2}
            showFirstButton
            showLastButton
          />
        </div>
      </div>
    </>
  );
};

export default UserDetailsTable;
