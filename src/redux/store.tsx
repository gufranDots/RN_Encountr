import { configureStore } from '@reduxjs/toolkit';
import reducer from "./reduxReducers"

export default configureStore({ reducer })