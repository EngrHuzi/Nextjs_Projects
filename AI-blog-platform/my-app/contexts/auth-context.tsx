"use client"

import React, { createContext, useContext, useEffect, useMemo, useState } from "react"
import type { AuthResponse, AuthState, LoginFormData, RegisterFormData, User } from "@/lib/auth"
import { authAPI } from "@/lib/auth"

interface AuthContextValue extends AuthState {
	login: (data: LoginFormData) => Promise<AuthResponse>
	register: (data: RegisterFormData) => Promise<AuthResponse>
	logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [user, setUser] = useState<User | null>(null)
	const [isLoading, setIsLoading] = useState<boolean>(true)

	useEffect(() => {
		let isMounted = true
		const loadUser = async () => {
			try {
				setIsLoading(true)
				const currentUser = await authAPI.getCurrentUser()
				if (isMounted) {
					setUser(currentUser)
				}
			} finally {
				if (isMounted) setIsLoading(false)
			}
		}
		loadUser()
		return () => {
			isMounted = false
		}
	}, [])

	const login = async (data: LoginFormData): Promise<AuthResponse> => {
		setIsLoading(true)
		try {
			const result = await authAPI.login(data.email, data.password)
			if (result.success && result.user) {
				localStorage.setItem("currentUser", JSON.stringify(result.user))
				setUser(result.user)
			}
			return result
		} finally {
			setIsLoading(false)
		}
	}

	const register = async (data: RegisterFormData): Promise<AuthResponse> => {
		setIsLoading(true)
		try {
			const { confirmPassword, ...payload } = data
			const result = await authAPI.register(payload)
			if (result.success && result.user) {
				localStorage.setItem("currentUser", JSON.stringify(result.user))
				setUser(result.user)
			}
			return result
		} finally {
			setIsLoading(false)
		}
	}

	const logout = async () => {
		setIsLoading(true)
		try {
			await authAPI.logout()
			setUser(null)
		} finally {
			setIsLoading(false)
		}
	}

	const value: AuthContextValue = useMemo(
		() => ({
			user,
			isLoading,
			isAuthenticated: Boolean(user),
			login,
			register,
			logout,
		}),
		[user, isLoading]
	)

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
	const ctx = useContext(AuthContext)
	if (!ctx) {
		throw new Error("useAuth must be used within an AuthProvider")
	}
	return ctx
}












