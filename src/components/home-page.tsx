import { useEffect } from "react";
import { motion } from "framer-motion";

import Layout from "./layout";
import { ChatList } from "./chat-list";

import {
  useAppDispatch,
  useAppSelector,
} from "../lib/store/hook";
import { getAllUsers } from "../lib/store/auth/auth-slice";


const HomePage = () => {
  const dispatch = useAppDispatch();

  const { users, usersStatus } = useAppSelector(
    (state) => state.auth
  );

  const { selectedContactId } = useAppSelector(
    (state) => state.layout
  );

  useEffect(() => {
    dispatch(getAllUsers());
  }, [dispatch]);

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="h-full"
      >
        <ChatList />

        
      </motion.div>
    </Layout>
  );
};

export default HomePage;