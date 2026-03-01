import React, { useEffect, useState } from "react";
import { Table, Button, message } from "antd";
import { EditOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import TheatreForm from "./TheatreForm";
import { useDispatch, useSelector } from "react-redux";
import { getAllTheatres } from "../../backend/theatre";
import { getCurrentUser } from "../../backend/auth";
import { setUserData } from "../../redux/userSlice";
import ShowModal from "./showModal";

const TheatreListPartner = () => {
  const [theatres, setTheatres] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { userData } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  const [formType, setFormType] = useState("add");
  const [selectedTheatre, setSelectedTheatre] = useState(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isShowModalOpen, setIsShowModalOpen] = useState(false);

  const tableHeadings = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "address",
      dataIndex: "address",
      key: "address",
    },
    {
      title: "email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "phone",
      dataIndex: "phone",
      key: "phone",
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (value, record, index) => {
        if (record.isActive) return "Approved";
        return "Pending / Blocked";
      },
    },
    {
      title: "Action",
      render: (value, record, index) => {
        return (
          <div className="d-flex gap-10">
            <Button
              onClick={() => {
                setIsModalOpen(true);
                setFormType("edit");
                setSelectedTheatre(record);
              }}
            >
              <EditOutlined />
            </Button>
            <Button
              onClick={() => {
                setIsDeleteModalOpen(true);
                setSelectedTheatre(record);
              }}
            >
              <DeleteOutlined />
            </Button>
            <Button
              onClick={() => {
                setIsShowModalOpen(true);
                setSelectedTheatre(record);
              }}
            >
              <PlusOutlined />
              Shows
            </Button>
          </div>
        );
      },
    },
  ];

  const getData = async (userId) => {
    try {
      const ownerId = userId || userData?._id;
      if (!ownerId) {
        message.error("User data not available. Please login.");
        return;
      }

      const response = await getAllTheatres({ owner: ownerId });
      if (response && response.success) {
        const allTheares = response.data || [];
        setTheatres(allTheares);
      } else {
        message.error(response?.message || "something went wrong");
      }
    } catch (error) {
      message.error(error?.message || "something went wrong");
    }
  };

  useEffect(() => {
    (async () => {
      const user = await getCurrentUser();
      dispatch(setUserData(user || null));
      if (user) {
        getData(user._id);
      }
    })();
  }, []);

  return (
    <div>
      <Button
        type="primary"
        onClick={() => {
          setIsModalOpen(true);
          setSelectedTheatre(null);
          setFormType("add");
        }}
      >
        Add theatre
      </Button>
      <Table dataSource={theatres} columns={tableHeadings} />
      {isModalOpen ? (
        <TheatreForm
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
          formType={formType}
          selectedTheatre={selectedTheatre}
          setSelectedTheatre={setSelectedTheatre}
          getData={getData}
        />
      ) : null}
      {isShowModalOpen ? (
        <ShowModal
          isModalOpen={isShowModalOpen}
          setIsModalOpen={setIsShowModalOpen}
          selectedTheatre={selectedTheatre}
          setSelectedTheatre={setSelectedTheatre}
        />
      ) : null}
    </div>
  );
};

export default TheatreListPartner;
