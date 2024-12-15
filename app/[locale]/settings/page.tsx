'use client'
import { useTranslations } from "next-intl";

export default function SettingsPage() {
    const  t = useTranslations('SettingsPage')
    return <div>{t('title')}

        
    </div>;
}