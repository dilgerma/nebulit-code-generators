import {Toaster} from "@/components/ui/toaster";
import {Toaster as Sonner} from "@/components/ui/sonner";
import {TooltipProvider} from "@/components/ui/tooltip";
import {AuthProvider} from "@/contexts/AuthContext";

import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {BrowserRouter, Routes, Route} from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Tables from "./pages/Tables";
import Staff from "./pages/Staff";
import Shifts from "./pages/Shifts";
import Tasks from "./pages/Tasks";
import Menus from "./pages/Menus";
import Vacations from "./pages/Vacations";
import NotFound from "./pages/NotFound";
import Auth from "@/pages/Auth.tsx";
import Register from "@/pages/Register.tsx";
import { ProtectedRoute } from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
    <QueryClientProvider client={queryClient}>
        <AuthProvider>
        <TooltipProvider>
            <Toaster/>
            <Sonner/>
            <BrowserRouter>
                <Routes>
                    <Route path="/register" element={<Register/>}/>
                    <Route path="/auth" element={<Auth/>}/>
                    <Route path="/" element={<ProtectedRoute><Dashboard/></ProtectedRoute>}/>
                    <Route path="/tables" element={<ProtectedRoute><Tables/></ProtectedRoute>}/>
                    <Route path="/staff" element={<ProtectedRoute><Staff/></ProtectedRoute>}/>
                    <Route path="/shifts" element={<ProtectedRoute><Shifts/></ProtectedRoute>}/>
                    <Route path="/tasks" element={<ProtectedRoute><Tasks/></ProtectedRoute>}/>
                    <Route path="/menus" element={<ProtectedRoute><Menus/></ProtectedRoute>}/>
                    <Route path="/vacations" element={<ProtectedRoute><Vacations/></ProtectedRoute>}/>
                    <Route path="*" element={<NotFound/>}/>
                </Routes>
            </BrowserRouter>
        </TooltipProvider>
        </AuthProvider>
    </QueryClientProvider>
);

export default App;
