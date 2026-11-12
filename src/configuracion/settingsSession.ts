import { authorizedMember, initialSettings, demoContext, type WorkshopSettings } from './settingsData'
let current:WorkshopSettings|undefined
export function loadDemoSettings(){return structuredClone(current??initialSettings())}
export function saveDemoSettings(settings:WorkshopSettings){authorizedMember(settings,demoContext);current=structuredClone(settings)}
