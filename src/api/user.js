import request from '@/utils/request'

export function userList() {
    return request.get('/trojan/user')
}

export function addUser(data) {
    return request.post('/trojan/user', data)
}

export function updateUser(data) {
    return request.post('/trojan/user/update', data)
}

export function delUser(id) {
    return request.delete(`/trojan/user?id=${id}`)
}

export function setExpire(data) {
    return request.post('/trojan/user/expire', data)
}

export function cancelExpire(id) {
    return request.delete(`/trojan/user/expire?id=${id}`)
}

export function userDetail(username) {
    return request.get(`/trojan/user/detail?username=${username}`)
}

export function saveIPGeo(data) {
    return request.post('/trojan/user/geo', data)
}

export function activeConnections(username) {
    return request.get(`/trojan/user/active-connections?username=${username}`)
}

export function killConnection(data) {
    return request.post('/trojan/user/active-connections/kill', data)
}

export function killConnectionByIP(ip) {
    const formData = new FormData()
    formData.append('client_ip', ip)
    return request.post('/trojan/user/kill-by-ip', formData)
}

export function trafficHistory(username) {
    return request.get(`/trojan/user/traffic-history?username=${username}`)
}

export function subLogs(username) {
    return request.get(`/trojan/user/sub-logs?username=${username}`)
}

export function domainStats(username) {
    return request.get(`/trojan/user/domain-stats?username=${username}`)
}

export function getIPBlacklist() {
    return request.get('/trojan/user/blacklist')
}

export function banIP(ip, duration) {
    const formData = new FormData()
    formData.append('ip', ip)
    formData.append('duration', duration)
    return request.post('/trojan/user/blacklist/ban', formData)
}

export function unbanIP(ip) {
    const formData = new FormData()
    formData.append('ip', ip)
    return request.post('/trojan/user/blacklist/unban', formData)
}

