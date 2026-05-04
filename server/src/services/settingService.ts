import { prisma } from '../config/prisma';

export interface SettingInput {
  cafeName?: string;
  slogan?: string | null;
  logoUrl?: string | null;
  phone?: string | null;
  address?: string | null;
  instagramUrl?: string | null;
  themePrimaryColor?: string;
  themeBackgroundColor?: string;
  themeCardColor?: string;
  themeTextColor?: string;
  themeMutedColor?: string;
}

const DEFAULT = {
  cafeName: "Uğur'um Cafe",
  slogan: 'Kahve • Huzur • Sohbet',
  themePrimaryColor: '#D8B56D',
  themeBackgroundColor: '#0F0F0F',
  themeCardColor: '#181818',
  themeTextColor: '#F5F5F5',
  themeMutedColor: '#A7A7A7',
};

export const settingService = {
  async get() {
    let setting = await prisma.setting.findFirst({ orderBy: { id: 'asc' } });
    if (!setting) {
      setting = await prisma.setting.create({ data: DEFAULT });
    }
    return setting;
  },

  async update(input: SettingInput) {
    const current = await this.get();
    return prisma.setting.update({
      where: { id: current.id },
      data: {
        cafeName: input.cafeName ?? current.cafeName,
        slogan: input.slogan ?? current.slogan,
        logoUrl: input.logoUrl ?? current.logoUrl,
        phone: input.phone ?? current.phone,
        address: input.address ?? current.address,
        instagramUrl: input.instagramUrl ?? current.instagramUrl,
        themePrimaryColor: input.themePrimaryColor ?? current.themePrimaryColor,
        themeBackgroundColor: input.themeBackgroundColor ?? current.themeBackgroundColor,
        themeCardColor: input.themeCardColor ?? current.themeCardColor,
        themeTextColor: input.themeTextColor ?? current.themeTextColor,
        themeMutedColor: input.themeMutedColor ?? current.themeMutedColor,
      },
    });
  },
};
