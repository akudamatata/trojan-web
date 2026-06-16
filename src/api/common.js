import request from '@/utils/request'

export function version() {
    return request.get('/common/version')
}

export function serverInfo() {
    return request.get('/common/serverInfo')
}

export function getTrafficHistory(params) {
    return request.get('/common/trafficHistory', { params })
}

export function setLoginInfo(data) {
    return request.post('/common/loginInfo', data)
}

export function setClashRules(data) {
    return request.post('/common/clashRules', data)
}

export function getClashRules() {
    return request.get('/common/clashRules')
}

export function resetClashRules() {
    return request.delete('/common/clashRules')
}

export function getWebPort() {
    return request.get('/trojan/webport')
}

export function setWebPort(data) {
    return request.post('/trojan/webport', data)
}

export function getCamouflageDomain() {
    return request.get('/common/camouflageDomain')
}

export function setCamouflageDomain(data) {
    return request.post('/common/camouflageDomain', data)
}

export function getCertInfo() {
    return request.get('/common/certInfo')
}

export function applyCert() {
    return request.post('/common/applyCert')
}

