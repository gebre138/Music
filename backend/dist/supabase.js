"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.supabase = void 0;
const supabase_js_1 = require("@supabase/supabase-js");
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !supabaseAnonKey)
    throw new Error("Missing Supabase URL or Key in environment variables.");
exports.supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseAnonKey);
