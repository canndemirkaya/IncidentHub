import React from 'react'
import { Layout, Typography } from 'antd'
import DashboardPage from './pages/dashboard-page'
import Panel from './components/Panel'

const { Header, Content } = Layout

export default function App() {
    return (
        <Layout className="app-layout">
            <Header className="app-header">
                <Typography.Title level={4} className="title">IncidentHub</Typography.Title>
            </Header>
            <Content className="app-content">
                <Panel title="Incidents">
                    <DashboardPage />
                </Panel>
            </Content>
        </Layout>
    )
}
