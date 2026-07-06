"use client"

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

import Layout from "./layout";
import { ChatList } from "./chat-list";

import {
  useAppDispatch,
  useAppSelector,
} from "../lib/store/hook";
import { checkAuth, getAllUsers } from "../lib/store/auth/auth-slice";


const HomePage = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const { users, user } = useAppSelector(
    (state) => state.auth
  );

  const { selectedUser: selectedContactId } = useAppSelector(
    (state) => state.layout
  );

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        await dispatch(checkAuth());
        await dispatch(getAllUsers());
      } catch {
        router.replace("/login");
      }
    };

    loadHomeData();
  }, [dispatch, router]);

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="h-full"
      >
        <ChatList contacts={users} selectedContactId={selectedContactId} />

        
      </motion.div>
    </Layout>
  );
};

export default HomePage;