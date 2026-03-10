import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, BarChart, Bar, Cell, Legend, PieChart, Pie } from "recharts";
import { _OWNERS } from "./owners_data";
import OnboardingTour from "./OnboardingTour";
import { SpeedInsights } from "@vercel/speed-insights/react";

// Compact encoded data: [code,issuer,hhi,hl(0=Low,1=Mod,2=High),ens,ff,c1,c3,fr,ss,ip,flags_bits,tier(0=Red,1=Amber,2=Green),th,tht,hc,nd]
// flags bits: 0=Insider>75%, 1=SingleCP>50%, 2=LowFloat<15%, 3=CritFloat<5%, 4=ZeroForeign
const _D = [["IBST", "Inti Bangun Sejahtera", 9990.0, 2, 1.0, 0.05, 99.95, 99.95, 0, 100.0, 99.95, 31, 0, "Pt Iforte Solusi Infot", "CP", 1, 0], ["MFMI", "Multifiling Mitra Indones", 9870.4, 2, 1.01, 0.65, 99.35, 99.35, 99.35, 99.3, 99.35, 15, 0, "Iron Mountain Hong Kon", "CP", 1, 1], ["SMDM", "Suryamas Dutamakmur", 9795.1, 2, 1.02, 1.03, 98.97, 98.97, 0, 99.0, 98.97, 31, 0, "Bumi Serpong Damai Tbk", "CP", 1, 0], ["SCPI", "Organon Pharma Indonesia", 9759.5, 2, 1.02, 1.21, 98.79, 98.79, 98.79, 98.8, 98.79, 15, 0, "Organon Llc", "CP", 1, 1], ["SUPR", "Solusi Tunas Pratama", 9479.8, 2, 1.05, 0.08, 97.33, 99.92, 0, 99.9, 99.92, 31, 0, "Pt Profesional Telekom", "CP", 2, 0], ["META", "Nusantara Infrastructure", 9440.9, 2, 1.06, 0.68, 97.14, 99.32, 0, 99.3, 99.32, 31, 0, "Pt Metro Pacific Tollw", "CP", 2, 0], ["PLIN", "Plaza Indonesia Realty", 9333.5, 2, 1.07, 3.39, 96.61, 96.61, 0, 96.6, 96.61, 31, 0, "Pt Plaza Indonesia Inv", "CP", 1, 0], ["ANJT", "Austindo Nusantara Jaya", 9206.6, 2, 1.09, 1.63, 95.92, 98.37, 95.92, 98.4, 98.37, 15, 0, "First Resources Limite", "CP", 2, 1], ["WICO", "Wicaksana Overseas Intern", 9127.0, 2, 1.1, 1.9, 95.5, 98.1, 98.1, 95.5, 95.5, 15, 0, "Ctla Safekeeping Accou", "CP", 2, 2], ["JAWA", "Jaya Agra Wattie", 8573.2, 2, 1.17, 2.48, 92.5, 97.52, 1.04, 96.5, 96.48, 15, 0, "Uob Kay Hian Pte Ltd A", "CP", 3, 1], ["INRU", "Toba Pulp Lestari", 8573.0, 2, 1.17, 3.13, 92.54, 96.87, 96.87, 92.5, 92.54, 15, 0, "Allied Hill Limited", "CP", 3, 3], ["SMAR", "Sinar Mas Agro Resources ", 8564.8, 2, 1.17, 0.84, 92.4, 99.16, 1.94, 94.3, 94.34, 15, 0, "Pt Purimas Sasmita", "CP", 3, 1], ["DUTI", "Duta Pertiwi", 8559.7, 2, 1.17, 0.59, 92.38, 99.41, 7.03, 99.4, 99.41, 15, 0, "Bumi Serpong Damai Tbk", "CP", 3, 1], ["FPNI", "Lotte Chemical Titan", 8556.2, 2, 1.17, 7.5, 92.5, 92.5, 92.5, 92.5, 92.5, 7, 0, "Lotte Chemical Titan I", "CP", 1, 1], ["AKSI", "Mineral Sumberdaya Mandir", 8548.9, 2, 1.17, 7.54, 92.46, 92.46, 0, 92.5, 92.46, 23, 0, "Pt Batulicin Enam Semb", "CP", 1, 0], ["HMSP", "Hanjaya Mandala Sampoerna", 8545.2, 2, 1.17, 7.56, 92.44, 92.44, 0, 92.4, 92.44, 23, 0, "Philip Morris Indonesi", "CP", 1, 0], ["BABY", "Multitrend Indo", 8537.9, 2, 1.17, 4.59, 92.35, 95.41, 95.41, 95.4, 95.41, 15, 0, "Blooming Years Pte.Ltd", "CP", 2, 1], ["CENT", "Centratama Telekomunikasi", 8511.3, 2, 1.17, 3.83, 92.17, 96.17, 96.17, 92.2, 92.17, 15, 0, "Ep Id Holdings Pte.Ltd", "CP", 2, 1], ["DVLA", "Darya - Varia Laboratoria", 8501.0, 2, 1.18, 4.02, 92.12, 95.98, 95.98, 92.1, 92.12, 15, 0, "Blue Sphere Singapore ", "CP", 2, 2], ["ERTX", "Eratex Djaja", 8499.0, 2, 1.18, 7.81, 92.19, 92.19, 0, 92.2, 92.19, 23, 0, "Pt Ungaran Sari Garmen", "CP", 1, 0], ["KIAS", "Keramika Indonesia Assosi", 8478.3, 2, 1.18, 4.25, 92.04, 95.75, 0, 1.8, 1.78, 28, 0, "Scg Decor Public Compa", "OT", 3, 0], ["EPMT", "Enseval Putera Megatradin", 8465.5, 2, 1.18, 5.75, 91.98, 94.25, 2.27, 92.0, 91.98, 7, 0, "Kalbe Farma Tbk Pt", "CP", 2, 1], ["IMJS", "Indomobil Multi Jasa", 8458.5, 2, 1.18, 8.03, 91.97, 91.97, 0, 92.0, 91.97, 23, 0, "Pt. Indomobil Sukses I", "CP", 1, 0], ["BKSW", "Bank Qnb Indonesia", 8395.4, 2, 1.19, 4.37, 91.57, 95.63, 94.63, 0.0, 0, 12, 0, "Qatar National Bank Q.", "IB", 3, 2], ["AGRS", "Bank Ibk Indonesia", 8379.2, 2, 1.19, 5.55, 91.49, 94.45, 91.49, 0.0, 0, 4, 1, "Industrial Bank Of Kor", "OT", 2, 1], ["BDMN", "Bank Danamon Indonesia", 8369.5, 2, 1.19, 6.89, 91.47, 93.11, 93.11, 0.0, 0, 4, 1, "Mufg Bank Ltd", "IB", 2, 2], ["IKBI", "Sumi Indo Kabel", 8368.1, 2, 1.2, 6.02, 91.46, 93.98, 91.46, 94.0, 93.98, 7, 0, "Sumitomo Electric Indu", "CP", 3, 1], ["MMLP", "Mega Manunggal Property", 8365.0, 2, 1.2, 6.64, 91.44, 93.36, 0, 93.4, 93.36, 23, 0, "Saka Industrial Arjaya", "CP", 2, 0], ["BNGA", "Bank Cimb Niaga", 8364.1, 2, 1.2, 7.53, 91.45, 92.47, 91.45, 0.0, 0, 4, 1, "Cimb Group Sdn Bhd", "IB", 2, 1], ["ADES", "Akasha Wira International", 8345.9, 2, 1.2, 7.61, 91.35, 92.39, 91.35, 92.4, 92.39, 7, 0, "Water Partners Bottlin", "CP", 2, 1], ["ESTI", "Ever Shine Textile Indust", 8324.8, 2, 1.2, 6.43, 91.21, 93.57, 0, 93.6, 93.57, 23, 0, "Cahaya Interkontinenta", "CP", 2, 0], ["BTPN", "Bank Smbc Indonesia", 8312.4, 2, 1.2, 0.4, 91.05, 96.69, 98.57, 0.0, 0, 12, 0, "Sumitomo Mitsui Bankin", "IB", 5, 3], ["ACST", "Acset Indonusa", 8312.0, 2, 1.2, 8.83, 91.17, 91.17, 0, 91.2, 91.17, 23, 0, "Pt. Karya Supra Perkas", "CP", 1, 0], ["GIAA", "Garuda Indonesia (Persero", 8304.3, 2, 1.2, 7.09, 91.11, 92.91, 0, 92.9, 92.91, 23, 0, "Perusahaan Perseroan (", "CP", 2, 0], ["BSWD", "Bank Of India Indonesia", 8301.4, 2, 1.2, 2.37, 90.96, 97.63, 90.96, 97.6, 97.63, 15, 0, "Bank Of India", "CP", 3, 1], ["SDRA", "Bank Woori Saudara Indone", 8261.3, 2, 1.21, 2.46, 90.75, 97.54, 90.75, 6.8, 6.79, 12, 0, "Woori Bank", "IB", 3, 1], ["SIPD", "Sreeya Sewu Indonesia", 8249.2, 2, 1.21, 5.38, 90.78, 94.62, 1.3, 93.3, 93.32, 7, 0, "Great Giant Pineapple", "CP", 3, 1], ["IPAC", "Era Graharealty", 8239.0, 2, 1.21, 1.88, 90.6, 98.12, 98.12, 93.3, 93.28, 15, 0, "Apac Investment 2 Pte ", "CP", 3, 2], ["KOIN", "Kokoh Inti Arebama", 8225.7, 2, 1.22, 4.34, 90.62, 95.66, 90.62, 95.7, 95.66, 15, 0, "Scg Distribution Compa", "CP", 3, 1], ["DNAR", "Bank Oke Indonesia", 8207.7, 2, 1.22, 4.39, 90.51, 95.61, 90.51, 5.1, 5.1, 12, 0, "Ok Next Co.Ltd", "IB", 3, 1], ["TALF", "Tunas Alfin", 8201.1, 2, 1.22, 1.37, 90.41, 96.41, 4.82, 93.8, 93.81, 15, 0, "Pt Proinvestindo", "CP", 5, 1], ["TSPC", "Tempo Scan Pacific", 8190.2, 2, 1.22, 9.5, 90.5, 90.5, 0, 90.5, 90.5, 23, 0, "Pt. Bogamulia Nagadi", "CP", 1, 0], ["BPII", "Batavia Prosperindo Inter", 8123.6, 2, 1.23, 0.26, 89.86, 99.74, 99.74, 94.8, 94.8, 15, 0, "Malacca Trust Pte. Ltd", "CP", 3, 1], ["WIKA", "Wijaya Karya (Persero)", 8119.8, 2, 1.23, 9.89, 90.11, 90.11, 0, 90.1, 90.11, 23, 0, "Perusahaan Perseroan (", "CP", 1, 0], ["YUPI", "Yupi Indo Jelly Gum", 8119.1, 2, 1.23, 1.1, 90.0, 94.83, 8.9, 95.0, 91.19, 15, 0, "Confectionery Consumer", "CP", 6, 1], ["PSAB", "J Resources Asia Pasifik", 8109.0, 2, 1.23, 5.83, 90.0, 94.17, 4.17, 91.7, 91.67, 5, 0, "Jimmy Budiarto", "ID", 3, 2], ["ADCP", "Adhi Commuter Properti", 8100.0, 2, 1.23, 10.0, 90.0, 90.0, 0, 90.0, 90.0, 23, 0, "Adhi Karya Persero Tbk", "CP", 1, 0], ["KAEF", "Kimia Farma", 8087.3, 2, 1.24, 5.75, 89.82, 94.25, 0, 92.0, 89.82, 23, 0, "Pt Bio Farma (Persero)", "CP", 2, 0], ["GLOB", "Globe Kita Terang", 8071.3, 2, 1.24, 1.86, 89.69, 96.52, 8.45, 89.7, 89.69, 15, 0, "Trikomsel Oke TbkPt", "CP", 4, 1], ["YPAS", "Yanaprima Hastapersada", 8038.8, 2, 1.24, 2.49, 89.47, 97.51, 0, 97.5, 97.51, 31, 0, "Pt Hastagraha Bumipers", "CP", 3, 0], ["BBMD", "Bank Mestika Dharma", 8016.4, 2, 1.25, 1.68, 89.44, 93.81, 4.26, 94.1, 94.12, 15, 0, "Mestika Benua Mas", "CP", 6, 2], ["KOBX", "Kobexindo Tractors", 8016.4, 2, 1.25, 6.67, 89.45, 93.33, 0, 93.3, 93.33, 23, 0, "Pt Kobexindo Investama", "CP", 2, 0], ["BNLI", "Bank Permata", 7989.4, 2, 1.25, 0.29, 89.12, 98.71, 98.71, 0.5, 0, 12, 0, "Bangkok Bank Public Co", "IB", 4, 2], ["MLBI", "Multi Bintang Indonesia", 7979.2, 2, 1.25, 9.6, 89.32, 90.4, 90.4, 90.4, 90.4, 7, 0, "Heineken International", "CP", 2, 2], ["LPCK", "Lippo Cikarang", 7921.0, 2, 1.26, 11.0, 89.0, 89.0, 0, 0.0, 0, 20, 1, "Kemuning Satiatama Pt", "OT", 1, 0], ["CAKK", "Cahayaputra Asa Keramik", 7862.4, 2, 1.27, 8.1, 88.64, 91.9, 0, 91.9, 91.9, 23, 0, "Kobin Keramik Industri", "CP", 3, 0], ["GOLF", "Intra Golflink Resorts", 7843.8, 2, 1.27, 3.51, 88.49, 92.28, 0, 96.5, 96.49, 31, 0, "Bali Pecatu Graha", "CP", 6, 0], ["INDS", "Indospring", 7793.1, 2, 1.28, 4.6, 88.11, 95.4, 4.9, 93.0, 90.5, 15, 0, "Indoprima Gemilang", "CP", 3, 1], ["CMNT", "Cemindo Gemilang", 7660.6, 2, 1.31, 1.58, 87.37, 93.36, 95.09, 96.7, 96.69, 15, 0, "Wh Investments Pte. Lt", "CP", 6, 3], ["CBDK", "Bangun Kosambi Sukses", 7617.9, 2, 1.31, 11.36, 87.27, 88.64, 0, 88.6, 88.64, 23, 0, "Pantai Indah Kapuk Dua", "CP", 2, 0], ["CEKA", "Wilmar Cahaya Indonesia", 7602.8, 2, 1.32, 4.73, 87.02, 94.02, 4.96, 95.3, 95.27, 15, 0, "Sentratama Niaga Indon", "CP", 4, 1], ["ABDA", "Asuransi Bina Dana Arta", 7582.3, 2, 1.32, 0.33, 86.75, 96.17, 99.67, 46.9, 3.5, 12, 0, "Oona Indonesia Pte Ltd", "IS", 4, 2], ["AGRO", "Bank Raya Indonesia", 7548.8, 2, 1.32, 10.72, 86.85, 89.28, 0, 1.2, 0, 20, 1, "Pt Bank Rakyat Indones", "IB", 2, 0], ["JARR", "Jhonlin Agro Raya", 7531.2, 2, 1.33, 2.76, 86.64, 92.06, 0, 10.6, 10.6, 28, 0, "Eshan Agro Sentosa Pt", "OT", 6, 0], ["BIMA", "Primarindo Asia Infrastru", 7502.5, 2, 1.33, 9.68, 86.57, 90.32, 0, 87.7, 87.7, 23, 0, "Golden Lestari Pt", "CP", 3, 0], ["IDPR", "Indonesia Pondasi Raya", 7459.0, 2, 1.34, 5.54, 86.26, 91.49, 2.45, 93.8, 93.19, 5, 0, "Manuel  Djunako", "ID", 5, 1], ["BMAS", "Bank Maspion Indonesia", 7444.8, 2, 1.34, 2.06, 86.03, 94.49, 88.48, 95.5, 95.49, 15, 0, "Kasikorn Vision Financ", "CP", 5, 2], ["MTWI", "Malacca Trust Wuwungan In", 7412.9, 2, 1.35, 3.11, 85.9, 92.63, 1.49, 95.4, 95.4, 15, 0, "Pt. Batavia Prosperind", "CP", 6, 1], ["BINO", "Perma Plasindo", 7399.6, 2, 1.35, 6.67, 85.68, 93.33, 85.68, 93.3, 93.33, 7, 0, "Ruhong Holding Pte Ltd", "CP", 2, 1], ["RELI", "Reliance Sekuritas Indone", 7370.3, 2, 1.36, 2.26, 85.65, 92.84, 0, 93.8, 93.83, 31, 0, "Reliance Capital Manag", "CP", 6, 0], ["ADMR", "Alamtri Minerals Indonesi", 7304.5, 2, 1.37, 12.18, 85.45, 87.82, 2.37, 86.5, 86.52, 7, 0, "Alamtri Resources Indo", "CP", 3, 2], ["SURI", "Maja Agung Latexindo", 7301.9, 2, 1.37, 10.61, 85.4, 89.39, 0, 89.4, 89.39, 21, 0, "Hansen Jap", "ID", 3, 0], ["HRME", "Menteng Heritage Realty", 7292.9, 2, 1.37, 13.42, 85.39, 86.58, 0, 86.6, 86.58, 23, 0, "Pt Wijaya Wisesa Realt", "CP", 2, 0], ["MLPT", "Multipolar Technology", 7257.4, 2, 1.38, 2.23, 84.95, 93.08, 1.65, 96.1, 96.12, 15, 0, "Pt. Multipolar Tbk", "CP", 6, 1], ["GDYR", "Goodyear Indonesia", 7252.9, 2, 1.38, 5.46, 85.0, 91.22, 1.88, 7.7, 7.66, 4, 1, "The Goodyear Tire & Ru", "OT", 5, 1], ["NISP", "Bank Ocbc Nisp", 7244.2, 2, 1.38, 11.59, 85.08, 88.41, 85.08, 88.4, 88.41, 7, 0, "Ocbc Overseas Investme", "CP", 3, 1], ["VINS", "Victoria Insurance", 7238.2, 2, 1.38, 4.41, 84.93, 90.45, 0, 94.1, 92.59, 31, 0, "Pt. Victoria Investama", "CP", 6, 0], ["UNVR", "Unilever Indonesia", 7224.4, 2, 1.38, 13.95, 84.99, 86.05, 0, 85.5, 84.99, 23, 0, "Unilever Indonesia Tbk", "CP", 2, 0], ["SMCB", "Solusi Bangun Indonesia", 7205.4, 2, 1.39, 1.32, 83.52, 98.68, 15.16, 98.7, 98.68, 15, 0, "Pt Semen Indonesia (Pe", "CP", 2, 1], ["SAME", "Sarana Meditama Metropoli", 7204.6, 2, 1.39, 11.1, 84.78, 88.9, 0, 88.9, 88.9, 23, 0, "Pt Elang Mahkota Tekno", "CP", 2, 0], ["GTSI", "Gts Internasional", 7191.0, 2, 1.39, 15.2, 84.8, 84.8, 0, 84.8, 84.8, 19, 0, "Humpuss Maritim Intern", "CP", 1, 0], ["NELY", "Pelayaran Nelly Dwi Putri", 7093.3, 2, 1.41, 6.94, 83.83, 93.06, 8.02, 93.1, 93.06, 7, 0, "Haskojaya AbadiPt", "CP", 3, 1], ["PANI", "Pantai Indah Kapuk Dua", 7091.8, 2, 1.41, 7.06, 84.09, 89.42, 8.85, 89.4, 89.42, 7, 0, "Multi Artha Pratama Pt", "CP", 5, 2], ["CUAN", "Petrindo Jaya Kreasi", 7088.9, 2, 1.41, 8.04, 84.1, 88.81, 7.86, 88.4, 88.45, 5, 1, "Prajogo Pangestu", "ID", 6, 1], ["CAMP", "Campina Ice Cream Industr", 7084.8, 2, 1.41, 5.02, 83.94, 91.95, 0, 95.0, 94.98, 21, 0, "Sabana Prawira Widjaja", "ID", 5, 0], ["TRJA", "Transkon Jaya", 7061.0, 2, 1.42, 7.6, 83.81, 91.37, 0, 92.4, 92.4, 23, 0, "Pt Samindo Resources T", "CP", 4, 0], ["ALKA", "Alakasa Industrindo", 7043.4, 2, 1.42, 6.86, 83.79, 89.08, 0, 93.1, 93.14, 23, 0, "Gesit Perkasa", "CP", 5, 0], ["TMAS", "Temas", 7021.3, 2, 1.42, 6.7, 83.66, 89.33, 0, 92.2, 91.13, 23, 0, "Pt Temas Lestari", "CP", 6, 0], ["MDIA", "Intermedia Capital", 6987.8, 2, 1.43, 5.47, 83.28, 91.72, 3.41, 93.4, 93.41, 7, 0, "Pt Visi Media Asia Tbk", "CP", 5, 2], ["OMED", "Jayamas Medica Industri", 6980.4, 2, 1.43, 5.19, 83.3, 91.72, 8.42, 86.4, 86.39, 7, 0, "Intisumber Hasilsempur", "CP", 5, 2], ["IGAR", "Champion Pacific Indonesi", 6969.7, 2, 1.43, 7.64, 83.22, 92.36, 0, 92.4, 92.36, 23, 0, "Pt Kingsford Holdings", "CP", 3, 0], ["SMKL", "Satyamitra Kemas Lestari", 6911.6, 2, 1.45, 10.03, 83.06, 87.1, 1.92, 88.0, 88.05, 7, 0, "Pt. Satyamitra Investi", "CP", 5, 1], ["APLN", "Agung Podomoro Land", 6868.9, 2, 1.46, 11.16, 82.72, 88.84, 1.12, 87.7, 87.72, 7, 0, "Indofica Pt", "CP", 3, 1], ["ELPI", "Pelayaran Nasional Ekalya", 6840.1, 2, 1.46, 1.84, 82.36, 91.48, 2.45, 95.7, 95.71, 15, 0, "Kreasi Cipta Timur", "CP", 6, 1], ["BPFI", "Woori Finance Indonesia", 6814.4, 2, 1.47, 1.59, 82.03, 93.9, 86.12, 91.8, 91.85, 15, 0, "Woori Card Co. Ltd.", "CP", 6, 2], ["MBSS", "Mitrabahtera Segara Sejat", 6812.1, 2, 1.47, 15.08, 82.5, 84.92, 2.42, 84.9, 84.92, 3, 1, "Pt Galley Adhika Arnaw", "CP", 2, 1], ["ARTA", "Arthavest", 6807.2, 2, 1.47, 0.44, 82.13, 90.86, 5.81, 98.2, 98.23, 13, 0, "Lucas Sh. Cn", "ID", 7, 1], ["EKAD", "Ekadharma International", 6799.2, 2, 1.47, 6.92, 82.26, 89.06, 4.29, 90.2, 90.16, 7, 0, "Pt. Ekadharma Inti Per", "CP", 5, 2], ["PGJO", "Bahtera Bumi Raya", 6796.0, 2, 1.47, 11.22, 82.3, 88.78, 0, 88.8, 88.78, 23, 0, "Pt Batu Investasi Indo", "CP", 3, 0], ["BATA", "Sepatu Bata", 6770.8, 2, 1.48, 8.55, 82.01, 91.45, 4.18, 5.3, 5.26, 4, 1, "Bafin (Nederland) B.V.", "OT", 3, 1], ["PTIS", "Indo Straits", 6712.9, 2, 1.49, 11.29, 81.82, 87.54, 3.42, 2.3, 1.17, 4, 1, "Straits Corporation Pt", "OT", 4, 1], ["AMAN", "Makmur Berkah Amanda", 6703.0, 2, 1.49, 2.17, 81.54, 90.2, 0, 16.3, 16.29, 28, 0, "Pt Griya Prima Amanda ", "OT", 7, 0], ["TBIG", "Tower Bersama Infrastruct", 6700.4, 2, 1.49, 7.21, 81.29, 92.79, 83.42, 90.7, 90.66, 7, 0, "Bersama Digital Infras", "CP", 3, 2], ["LPIN", "Multi Prima Sejahtera", 6694.9, 2, 1.49, 11.22, 81.71, 87.37, 0, 88.8, 88.78, 23, 0, "Pt. Multipolar Tbk", "CP", 4, 0], ["INAF", "Indofarma", 6694.8, 2, 1.49, 5.6, 80.66, 94.4, 0, 87.5, 80.66, 23, 0, "Pt Bio Farma (Persero)", "CP", 2, 0], ["HALO", "Haloni Jane", 6601.6, 2, 1.51, 10.48, 81.06, 87.45, 2.07, 89.5, 89.52, 5, 1, "Hansen Jap", "ID", 5, 2], ["LIFE", "Msig Life Insurance Indon", 6564.7, 2, 1.52, 2.61, 80.0, 94.61, 80.0, 56.3, 15.28, 12, 0, "Mitsui Sumitomo Insura", "IS", 5, 1], ["MINE", "Sinar Terang Mandiri", 6562.4, 2, 1.52, 6.82, 80.79, 87.83, 4.46, 91.5, 91.53, 7, 0, "Pt Mitra Berkarya Suks", "CP", 6, 1], ["SOSS", "Shield On Service", 6555.8, 2, 1.53, 0.66, 79.83, 96.84, 4.5, 99.3, 99.34, 15, 0, "Pt. Alsok Bass Indones", "CP", 4, 1], ["RSGK", "Kedoya Adyaraya", 6554.6, 2, 1.53, 3.16, 79.84, 95.31, 0, 96.8, 96.84, 31, 0, "Pt Sarana Meditama Met", "CP", 4, 0], ["POLU", "Golden Flower", 6513.9, 2, 1.54, 0.19, 79.99, 92.41, 0, 99.8, 99.81, 31, 0, "Pt Profashion Apparel", "CP", 5, 0], ["RIGS", "Rig Tenders Indonesia", 6499.7, 2, 1.54, 10.72, 80.54, 83.9, 4.82, 84.5, 84.46, 7, 0, "Pt. Surya Indah Muara ", "CP", 7, 1], ["AMAG", "Asuransi Multi Artha Guna", 6493.2, 2, 1.54, 3.16, 80.0, 91.96, 80.0, 86.4, 83.76, 15, 0, "Fairfax Asia Limited", "CP", 5, 1], ["ICBP", "Indofood Cbp Sukses Makmu", 6491.5, 2, 1.54, 15.18, 80.53, 83.62, 2.43, 82.7, 80.53, 3, 1, "Indofood Sukses Makmur", "CP", 4, 2], ["RISE", "Jaya Sukses Makmur Sentos", 6491.0, 2, 1.54, 4.47, 80.3, 87.35, 2.36, 93.2, 93.17, 15, 0, "Pt Tancorp Global Sent", "CP", 7, 1], ["NETV", "Mdtv Media Technologies", 6490.4, 2, 1.54, 3.92, 80.05, 90.89, 0, 96.1, 96.08, 31, 0, "Pt Md Pictures Tbk", "CP", 6, 0], ["RONY", "Aracord Nusantara Group", 6478.7, 2, 1.54, 1.14, 80.0, 89.57, 80.0, 98.9, 98.86, 15, 0, "Honour Accord Limited", "CP", 6, 1], ["TAMU", "Pelayaran Tamarin Samudra", 6454.1, 2, 1.55, 5.77, 80.0, 88.82, 14.23, 90.1, 90.09, 7, 0, "Pt Andalan Lepas Panta", "CP", 5, 2], ["PEVE", "Penta Valent", 6429.3, 2, 1.56, 11.92, 80.0, 86.53, 0, 87.3, 86.53, 23, 0, "Tancorp Mega Buana Pt", "CP", 4, 0], ["AUTO", "Astra Otoparts", 6425.2, 2, 1.56, 14.01, 80.0, 85.99, 4.9, 86.0, 85.99, 7, 0, "Pt Astra International", "CP", 3, 1], ["INPS", "Indah Prakasa Sentosa", 6416.4, 2, 1.56, 11.86, 79.79, 88.14, 0, 87.4, 86.71, 23, 0, "Pt. Surya Perkasa Sent", "CP", 3, 0], ["KRAS", "Krakatau Steel", 6403.2, 2, 1.56, 17.46, 80.0, 82.54, 1.23, 80.7, 80.0, 3, 1, "Perusahaan Perseroan (", "CP", 3, 1], ["ERAL", "Sinar Eka Selaras", 6402.8, 2, 1.56, 17.62, 80.0, 82.38, 0, 81.8, 81.16, 19, 0, "Erajaya Swasembada Tbk", "CP", 3, 0], ["FISH", "Fks Multi Agro", 6392.6, 2, 1.56, 0.9, 79.06, 93.86, 0, 99.1, 99.1, 31, 0, "Pt.Fks Corporindo Indo", "CP", 5, 0], ["HRUM", "Harum Energy", 6377.0, 2, 1.57, 15.01, 79.79, 83.91, 0, 83.8, 82.52, 19, 0, "Karunia Bara PerkasaP", "CP", 4, 0], ["FAPA", "Fap Agri", 6374.9, 2, 1.57, 0.73, 79.31, 90.27, 88.31, 99.3, 99.27, 15, 0, "Prinsep Management Lim", "CP", 7, 1], ["RSCH", "Charlie Hospital Semarang", 6358.7, 2, 1.57, 7.64, 79.43, 89.0, 0, 92.4, 92.36, 23, 0, "Pt. Wahyu Agung", "CP", 6, 0], ["AALI", "Astra Agro Lestari", 6353.7, 2, 1.57, 18.14, 79.68, 81.86, 0, 80.8, 79.68, 19, 0, "Pt Astra International", "CP", 2, 0], ["BEER", "Jobubu Jarum Minahasa", 6350.8, 2, 1.57, 3.8, 79.32, 87.34, 0, 92.2, 88.25, 31, 0, "Pt. Maju Minuman Minah", "CP", 6, 0], ["FITT", "Hotel Fitra International", 6325.1, 2, 1.58, 5.68, 79.16, 88.56, 5.86, 94.3, 94.32, 7, 0, "Pt Jinlong Resources I", "CP", 6, 2], ["ETWA", "Eterindo Wahanatama", 6317.0, 2, 1.58, 9.19, 79.26, 86.75, 5.47, 80.8, 80.81, 7, 0, "Pt Mordred Investama I", "CP", 6, 2], ["SHID", "Hotel Sahid Jaya Internat", 6313.1, 2, 1.58, 2.37, 78.97, 88.62, 2.79, 97.6, 97.63, 15, 0, "Pt Empu Sahid Internat", "CP", 6, 1], ["KINO", "Kino Indonesia", 6300.2, 2, 1.59, 2.95, 79.0, 86.59, 5.78, 91.3, 91.27, 15, 0, "Pt. Kino Investindo", "CP", 7, 2], ["FORE", "Fore Kopi Indonesia", 6274.5, 2, 1.59, 4.39, 78.92, 85.89, 86.11, 87.5, 86.53, 15, 0, "Fore Holdings Pte. Ltd", "CP", 8, 1], ["DKHH", "Cipta Sarana Medika", 6274.2, 2, 1.59, 20.79, 79.21, 79.21, 0, 79.2, 79.21, 19, 0, "Siliwangi Djajakusumah", "CP", 1, 0], ["TIFA", "Kdb Tifa Finance", 6259.9, 2, 1.6, 0.39, 77.5, 97.36, 77.5, 17.2, 17.25, 12, 0, "The Korea Development ", "IB", 4, 1], ["IRRA", "Itama Ranoraya", 6245.7, 2, 1.6, 12.07, 78.78, 86.71, 2.17, 87.9, 87.93, 7, 0, "Pt Global Dinamika Ken", "CP", 4, 1], ["MGLV", "Panca Anugrah Wisesa", 6244.1, 2, 1.6, 6.48, 78.74, 86.25, 3.52, 90.0, 90.0, 7, 0, "Nextier Datamate Cente", "CP", 7, 1], ["KDSI", "Kedawung Setia Industrial", 6236.3, 2, 1.6, 6.13, 78.52, 89.09, 0, 93.9, 93.87, 23, 0, "Kitasubur Utama Pt", "CP", 5, 0], ["BAIK", "Bersama Mencapai Puncak", 6217.6, 2, 1.61, 19.79, 78.84, 80.21, 0, 80.2, 80.21, 19, 0, "Anak Baik Sejahtera", "CP", 2, 0], ["BESS", "Batulicin Nusantara Marit", 6215.6, 2, 1.61, 4.45, 78.36, 88.81, 0, 95.5, 95.55, 31, 0, "Pt Batulicin Enam Semb", "CP", 6, 0], ["BELL", "Trisula Textile Industrie", 6209.3, 2, 1.61, 9.27, 78.13, 90.73, 0, 90.7, 90.73, 23, 0, "Pt Trisula Internation", "CP", 3, 0], ["LIVE", "Homeco Victoria Makmur", 6204.4, 2, 1.61, 14.55, 78.69, 82.79, 0, 85.5, 85.45, 23, 0, "Pt. Homeco Global Inve", "CP", 5, 0], ["POLL", "Pollux Properties Indones", 6200.2, 2, 1.61, 1.66, 78.14, 88.96, 10.41, 87.9, 87.93, 15, 0, "Pt Borneo Melawai Perk", "CP", 6, 1], ["ACRO", "Samcro Hyosung Adilestari", 6190.4, 2, 1.62, 10.27, 78.4, 86.67, 3.06, 89.7, 89.73, 5, 1, "Tae Sung Chung", "ID", 4, 1], ["MHKI", "Multi Hanna Kreasindo", 6185.8, 2, 1.62, 16.58, 78.6, 82.1, 0, 83.4, 83.42, 19, 0, "Pt. Multi Hanna Sinerg", "CP", 4, 0], ["PTPS", "Pulau Subur", 6168.5, 2, 1.62, 21.46, 78.54, 78.54, 0, 78.5, 78.54, 19, 0, "Pt. Sekawan Kontrindo", "CP", 1, 0], ["IKPM", "Ikapharmindo Putramas", 6140.1, 2, 1.63, 7.76, 78.11, 85.13, 0, 86.1, 79.89, 23, 0, "Pt Ikapharma Inti Mas", "CP", 7, 0], ["KAQI", "Jantra Grupo Indonesia", 6136.1, 2, 1.63, 20.23, 78.32, 79.77, 0, 79.8, 79.77, 19, 0, "Pt. Tahtra Kertajaya I", "CP", 2, 0], ["CLAY", "Citra Putra Realty", 6128.3, 2, 1.63, 0.67, 77.77, 87.27, 0, 21.6, 21.56, 28, 0, "Citra Putra Mandiri Pt", "OT", 8, 0], ["RCCC", "Utama Radar Cahaya", 6104.7, 2, 1.64, 6.22, 77.92, 83.06, 0, 93.8, 93.78, 23, 0, "Pt. Gelora Rimba Jaya", "CP", 9, 0], ["RLCO", "Abadi Lestari Indonesia", 6062.6, 2, 1.65, 4.68, 77.6, 83.13, 3.45, 89.1, 89.06, 15, 0, "Realco Omega Investama", "CP", 9, 2], ["IPCM", "Jasa Armada Indonesia", 6045.5, 2, 1.65, 7.22, 76.89, 91.67, 0, 13.3, 10.78, 20, 1, "Pt Pelindo Jasa Mariti", "OT", 4, 0], ["FORU", "Fortune Indonesia", 6038.5, 2, 1.66, 9.34, 76.81, 90.66, 79.11, 90.7, 90.66, 7, 0, "Imr Asia Holding Pte L", "CP", 3, 2], ["SIDO", "Industri Jamu Dan Farmasi", 6031.9, 2, 1.66, 16.51, 77.59, 81.73, 1.76, 82.6, 81.73, 3, 1, "Pt Hotel Candi Baru", "CP", 4, 1], ["ASLC", "Autopedia Sukses Lestari", 6030.2, 2, 1.66, 18.41, 77.6, 81.59, 2.49, 81.6, 81.59, 3, 1, "Adi Sarana Armada Tbk ", "CP", 3, 1], ["MTRA", "Mitra Pemuda", 6022.1, 2, 1.66, 4.37, 77.14, 86.06, 2.32, 16.2, 16.17, 12, 0, "Mitra Ditosam Indonesi", "OT", 6, 1], ["AWAN", "Era Digital Media", 6012.1, 2, 1.66, 8.31, 76.62, 90.23, 11.64, 85.9, 80.05, 7, 0, "Rajati Alia Kapital Pt", "CP", 4, 1], ["ASJT", "Asuransi Jasa Tania", 6011.9, 2, 1.66, 11.29, 77.39, 82.2, 0, 45.6, 5.17, 20, 1, "Dana Pensun Perkebunan", "PF", 7, 0], ["SWAT", "Sriwahana Adityakarta", 5979.7, 2, 1.67, 13.97, 77.22, 81.63, 0, 86.0, 86.03, 23, 0, "Pt. Sumber Makmur Lumi", "CP", 6, 0], ["FOOD", "Sentra Food Indonesia", 5977.6, 2, 1.67, 4.96, 76.92, 85.42, 0, 18.1, 18.12, 28, 0, "Super Capital Indonesi", "OT", 7, 0], ["KING", "Hoffmen Cleanindo", 5971.7, 2, 1.67, 3.18, 76.84, 86.44, 0, 96.8, 96.82, 31, 0, "Japarto Sukses Mandiri", "CP", 9, 0], ["PPRE", "Pp Presisi", 5959.4, 2, 1.68, 11.74, 76.99, 83.56, 2.18, 80.2, 78.03, 7, 0, "Pt.Pembangunan Perumah", "CP", 6, 1], ["MIDI", "Midi Utama Indonesia", 5956.6, 2, 1.68, 14.73, 77.09, 80.83, 1.2, 83.3, 82.52, 7, 0, "Sumber Alfaria Trijaya", "CP", 6, 1], ["KARW", "Meratus Jasa Prima", 5935.9, 2, 1.68, 21.46, 77.03, 78.54, 0, 78.5, 78.54, 19, 0, "Saranakelola Investa", "CP", 2, 0], ["ASGR", "Astra Graphia", 5932.7, 2, 1.69, 16.08, 76.87, 82.81, 0, 83.9, 83.92, 19, 0, "Pt Astra International", "CP", 4, 0], ["TEBE", "Dana Brata Luhur", 5928.9, 2, 1.69, 16.98, 76.91, 81.93, 5.02, 82.5, 81.93, 3, 1, "Pt. Dua Samudera Perka", "CP", 4, 2], ["PURI", "Puri Global Sukses", 5924.8, 2, 1.69, 18.05, 76.8, 81.95, 5.15, 82.0, 81.95, 3, 1, "Pt. Bumi Kreasi Baru", "CP", 2, 1], ["BELI", "Global Digital Niaga", 5923.7, 2, 1.69, 8.29, 76.57, 85.59, 0, 91.7, 91.71, 23, 0, "Pt Global Investama An", "CP", 5, 0], ["GOLL", "Golden Plantation", 5912.9, 2, 1.69, 4.58, 76.42, 84.89, 19.0, 95.4, 95.42, 15, 0, "Jom Prawarsa Indonesia", "CP", 6, 2], ["ADMF", "Adira Dinamika Multi Fina", 5908.2, 2, 1.69, 6.58, 74.5, 93.42, 18.92, 0.0, 0, 4, 1, "Bank Danamon Indonesia", "IB", 2, 1], ["POLA", "Pool Advista Finance", 5895.1, 2, 1.7, 11.11, 76.34, 86.12, 0, 84.0, 79.11, 23, 0, "Pt Pool Advista Indone", "CP", 5, 0], ["PTMR", "Master Print", 5889.5, 2, 1.7, 6.48, 76.42, 84.23, 0, 93.5, 93.52, 23, 0, "Mitra Pack Tbk", "CP", 8, 0], ["HUMI", "Humpuss Maritim Internasi", 5878.6, 2, 1.7, 15.07, 76.43, 84.93, 0, 84.9, 84.93, 19, 0, "Pt Humpuss Intermoda T", "CP", 3, 0], ["AYAM", "Janu Putra Sejahtera", 5870.6, 2, 1.7, 17.8, 76.55, 80.52, 0, 82.2, 82.2, 17, 1, "Singgih Januratmoko", "ID", 4, 0], ["MKAP", "Multikarya Asia Pasifik R", 5845.0, 2, 1.71, 7.87, 76.0, 85.72, 0, 92.1, 92.13, 23, 0, "Pt. International Sawo", "CP", 5, 0], ["TOOL", "Rohartindo Nusantara Luas", 5804.7, 2, 1.72, 19.32, 76.1, 80.68, 0, 80.7, 80.68, 19, 0, "Pt Rohartindo Maju Per", "CP", 3, 0], ["ATAP", "Trimitra Prawara Goldland", 5802.7, 2, 1.72, 15.67, 76.0, 82.33, 0, 84.3, 84.33, 19, 0, "Trimitra Prawara", "CP", 4, 0], ["SMBR", "Semen Baturaja", 5786.7, 2, 1.73, 11.84, 75.51, 88.16, 0, 81.8, 75.51, 23, 0, "Pt Semen Indonesia (Pe", "CP", 3, 0], ["DAYA", "Duta Intidaya", 5786.0, 2, 1.73, 0.78, 73.87, 95.3, 80.76, 18.5, 18.46, 12, 0, "Total Alliance Holding", "IB", 5, 2], ["AMAR", "Bank Amar Indonesia", 5777.6, 2, 1.73, 3.62, 75.25, 87.75, 86.79, 88.5, 88.47, 15, 0, "Tolaram Pte. Ltd.", "CP", 6, 3], ["NEST", "Esta Indonesia", 5771.0, 2, 1.73, 4.56, 75.48, 85.49, 11.36, 90.4, 90.43, 13, 0, "Hoo Anton Siswanto", "ID", 8, 3], ["SCMA", "Surya Citra Media", 5738.6, 2, 1.74, 11.43, 74.42, 88.57, 0, 88.6, 88.57, 23, 0, "Pt Elang Mahkota Tekno", "CP", 2, 0], ["BBSI", "Krom Bank Indonesia", 5736.5, 2, 1.74, 1.43, 75.0, 84.88, 4.58, 98.6, 98.57, 15, 0, "Pt Finaccel Teknologi ", "CP", 6, 1], ["NIRO", "City Retail Developments", 5708.5, 2, 1.75, 9.91, 75.25, 83.19, 0, 82.7, 75.25, 23, 0, "Pt Mega Inti Perdana U", "CP", 7, 0], ["MYTX", "Asia Pacific Investama", 5688.6, 2, 1.76, 6.44, 73.09, 93.56, 0, 93.6, 93.56, 23, 0, "Indah Jaya Investama P", "CP", 3, 0], ["KBRI", "Kertas Basuki Rachmat Ind", 5680.3, 2, 1.76, 16.96, 75.25, 80.65, 0, 6.1, 5.4, 16, 1, "Jaksa Agung Muda Bidan", "OT", 5, 0], ["PBID", "Panca Budi Idaman", 5653.2, 2, 1.77, 12.18, 74.67, 84.72, 0, 87.8, 87.82, 23, 0, "Pt Alphen Internasiona", "CP", 5, 0], ["URBN", "Urban Jakarta Propertindo", 5652.4, 2, 1.77, 5.27, 74.3, 88.86, 14.56, 80.2, 80.17, 7, 0, "Pt. Nusa Wijaya Proper", "CP", 6, 1], ["MERK", "Merck", 5647.1, 2, 1.77, 7.51, 73.99, 89.15, 16.0, 15.2, 15.16, 4, 1, "Merck Holding Gmbh", "OT", 5, 3], ["PKPK", "Paragon Karya Perkasa", 5626.3, 2, 1.78, 23.86, 75.0, 76.14, 0, 76.1, 76.14, 19, 0, "Pt. Deli Putra Bangsa", "CP", 2, 0], ["GEMA", "Gema Grahasarana", 5606.2, 2, 1.78, 17.95, 74.74, 80.28, 0, 82.0, 82.05, 19, 0, "Pt. Virucci Indogriya ", "CP", 4, 0], ["MAPB", "Map Boga Adiperkasa", 5605.0, 2, 1.78, 1.85, 71.98, 95.3, 23.32, 95.0, 94.97, 15, 0, "Mitra Adiperkasa Tbk", "CP", 4, 1], ["BBSS", "Bumi Benowo Sukses Sejaht", 5599.7, 2, 1.79, 5.39, 72.92, 91.2, 0, 21.7, 21.69, 20, 1, "Agung Alam Anugrah Pt", "OT", 6, 0], ["SAMF", "Saraswanti Anugerah Makmu", 5597.3, 2, 1.79, 1.81, 74.27, 83.15, 0, 98.2, 98.19, 31, 0, "Pt. Saraswanti Utama", "CP", 9, 0], ["WSKT", "Waskita Karya (Persero)", 5567.5, 2, 1.8, 23.88, 74.6, 76.12, 0, 75.4, 74.6, 18, 1, "Perusahaan Perseroan (", "CP", 2, 0], ["PJAA", "Pembangunan Jaya Ancol", 5510.9, 2, 1.81, 8.29, 72.0, 91.71, 0, 19.7, 19.71, 20, 1, "Pemerinta1H Daerah Dki", "OT", 3, 0], ["SDPC", "Millennium Pharmacon Inte", 5505.6, 2, 1.82, 8.78, 73.43, 86.51, 73.43, 89.5, 87.86, 7, 0, "Pharmaniaga Internatio", "CP", 6, 1], ["CBPE", "Citra Buana Prasida", 5477.2, 2, 1.83, 2.76, 73.15, 84.98, 0, 97.2, 97.24, 31, 0, "Sandhi Parama Nusa", "CP", 6, 0], ["SIMP", "Salim Ivomas Pratama", 5469.8, 2, 1.83, 12.23, 73.46, 85.17, 73.46, 11.7, 11.71, 4, 1, "Indofood Agri Resource", "OT", 5, 1], ["ASDM", "Asuransi Dayin Mitra", 5463.1, 2, 1.83, 6.58, 73.33, 84.65, 0, 92.9, 92.38, 23, 0, "Equity Development Inv", "CP", 7, 0], ["KOPI", "Mitra Energi Persada", 5434.9, 2, 1.84, 6.85, 72.86, 87.39, 7.5, 93.2, 93.15, 7, 0, "Pt. Mulya Tara Mandiri", "CP", 5, 1], ["SOUL", "Mitra Tirta Buwana", 5407.9, 2, 1.85, 16.97, 73.21, 83.03, 0, 83.0, 83.03, 19, 0, "Makna Prakarsa Utama ", "CP", 3, 0], ["COWL", "Cowell Development", 5337.6, 2, 1.87, 2.56, 71.12, 93.59, 22.47, 96.7, 95.86, 15, 0, "Pt Gama Nusapala", "CP", 5, 1], ["TDPM", "Tridomain Performance Mat", 5327.2, 2, 1.88, 5.77, 72.51, 81.12, 91.5, 81.2, 81.19, 7, 0, "Dh Corporation Ltd", "CP", 9, 3], ["ARCI", "Archi Indonesia", 5311.1, 2, 1.88, 14.19, 71.89, 85.81, 0, 83.7, 83.65, 23, 0, "Pt Rajawali Corpora", "CP", 3, 0], ["UFOE", "Damai Sejahtera Abadi", 5296.6, 2, 1.89, 7.46, 72.0, 84.49, 0, 92.5, 92.54, 23, 0, "Damai Sejahtera Lestar", "CP", 5, 0], ["LABS", "Ubc Medical Indonesia", 5281.7, 2, 1.89, 14.76, 72.39, 78.97, 2.98, 85.2, 85.24, 7, 0, "Optel Investama Mulia", "CP", 5, 1], ["PTMP", "Mitra Pack", 5270.5, 2, 1.9, 21.59, 72.51, 77.07, 0, 78.4, 78.41, 19, 0, "Kencana Usaha Sentosa", "CP", 4, 0], ["MTEL", "Dayamitra Telekomunikasi", 5253.7, 2, 1.9, 7.75, 71.83, 83.14, 11.46, 80.8, 80.79, 7, 0, "Pt Telekomunikasi Indo", "CP", 6, 2], ["SMGA", "Sumber Mineral Global Aba", 5250.5, 2, 1.9, 17.78, 72.0, 81.13, 0, 81.1, 80.0, 19, 0, "Sumber Global Energy T", "CP", 4, 0], ["LINK", "Link Net", 5223.0, 2, 1.91, 0.46, 69.38, 93.36, 75.42, 23.6, 23.04, 12, 0, "Axiata Investments (In", "IB", 6, 2], ["BBRM", "Pelayaran Nasional Bina B", 5220.5, 2, 1.92, 7.35, 70.73, 90.8, 14.43, 90.8, 90.8, 7, 0, "Pt. Marco Polo Indones", "CP", 4, 2], ["VRNA", "Mizuho Leasing Indonesia", 5195.7, 2, 1.92, 2.12, 67.44, 96.79, 67.44, 4.8, 4.29, 12, 0, "Mizuho Leasing Co Ltd", "IB", 4, 1], ["VISI", "Satu Visi Putra", 5191.0, 2, 1.93, 10.56, 71.54, 82.11, 0, 89.4, 89.44, 21, 0, "David Dwiputra", "ID", 7, 0], ["PRIM", "Royal Prima", 5190.2, 2, 1.93, 19.31, 71.72, 80.69, 0, 80.7, 80.69, 17, 1, "I Nyoman Ehrich Lister", "ID", 3, 0], ["WOMF", "Wahana Ottomitra Multiart", 5184.0, 2, 1.93, 4.86, 67.49, 94.08, 1.58, 26.1, 26.07, 12, 0, "Pt Bank Maybank Indone", "IB", 4, 1], ["RANC", "Supra Boga Lestari", 5180.5, 2, 1.93, 3.61, 70.56, 88.15, 0, 96.4, 96.39, 31, 0, "Pt Global Digital Niag", "CP", 6, 0], ["FASW", "Fajar Surya Wisesa", 5176.4, 2, 1.93, 0.22, 59.85, 99.78, 99.78, 99.8, 99.78, 15, 0, "Siam Kraft Industry Co", "CP", 2, 2], ["PNBS", "Bank Panin Dubai Syariah", 5159.3, 2, 1.94, 7.6, 67.3, 92.4, 25.1, 0.0, 0, 4, 1, "Bank Pan Indonesia Tbk", "IB", 2, 1], ["BRPT", "Barito Pacific", 5137.2, 2, 1.95, 15.38, 71.37, 79.21, 13.25, 71.4, 71.37, 0, 1, "Prajogo Pangestu", "ID", 6, 3], ["KLAS", "Pelayaran Kurnia Lautan S", 5136.6, 2, 1.95, 28.33, 71.67, 71.67, 0, 71.7, 71.67, 16, 1, "Kurnyatjan Sakti Efend", "ID", 1, 0], ["SFAN", "Surya Fajar Capital", 5131.7, 2, 1.95, 12.94, 71.24, 80.29, 0, 87.1, 87.06, 23, 0, "Pt Surya Fajar Corpora", "CP", 6, 0], ["CBUT", "Citra Borneo Utama", 5114.7, 2, 1.96, 1.45, 70.22, 86.13, 15.91, 82.6, 82.64, 15, 0, "Pt Sawit Sumbermas Sar", "CP", 8, 1], ["IPCC", "Indonesia Kendaraan Termi", 5112.6, 2, 1.96, 22.13, 71.28, 77.87, 1.05, 5.5, 5.54, 0, 2, "Pelindo Multi Terminal", "OT", 3, 1], ["TIRT", "Tirta Mahakam Resources", 5108.6, 2, 1.96, 18.76, 71.13, 80.01, 0, 81.2, 81.24, 19, 0, "Harita Jayaraya", "CP", 4, 0], ["CPRI", "Capri Nusa Satu Properti", 5095.5, 2, 1.96, 22.4, 71.2, 77.6, 4.87, 0.8, 0, 0, 2, "Pt Rdw Global Investas", "OT", 3, 1], ["WOOD", "Integra Indocabinet", 5091.0, 2, 1.96, 16.94, 71.05, 79.27, 0, 83.1, 83.06, 19, 0, "Pt Integra Indo Lestar", "CP", 5, 0], ["MRAT", "Mustika Ratu", 5090.9, 2, 1.96, 15.91, 71.21, 75.29, 0, 84.1, 84.09, 19, 0, "Mustika Ratu Investama", "CP", 10, 0], ["BEEF", "Estika Tata Tiara", 5086.9, 2, 1.97, 10.79, 70.59, 82.68, 70.59, 85.2, 85.24, 7, 0, "Asia Agri Internationa", "CP", 5, 1], ["GRPM", "Graha Prima Mentari", 5086.2, 2, 1.97, 12.3, 70.55, 83.36, 0, 87.7, 87.7, 23, 0, "Pt Prima Multi Usaha I", "CP", 5, 0], ["GMFI", "Garuda Maintenance Facili", 5078.6, 2, 1.97, 6.79, 65.77, 93.21, 0, 93.2, 93.21, 23, 0, "Pt Angkasa Pura Indone", "CP", 2, 0], ["HRTA", "Hartadinata Abadi", 5067.8, 2, 1.97, 20.13, 71.0, 77.47, 2.4, 77.0, 74.05, 2, 1, "Pt. Terang Anugrah Aba", "CP", 4, 1], ["NICE", "Adhi Kartiko Pratama", 5066.0, 2, 1.97, 4.07, 69.57, 89.62, 0, 95.9, 95.93, 31, 0, "Energy Battery Indones", "CP", 5, 0], ["SOFA", "Solusi Environment Asia", 5065.6, 2, 1.97, 21.86, 70.97, 78.14, 0, 78.1, 78.14, 19, 0, "Pt Asia Investment Cap", "CP", 3, 0], ["SMLE", "Sinergi Multi Lestarindo", 5035.7, 2, 1.99, 11.26, 70.55, 78.66, 10.89, 77.8, 77.85, 7, 0, "Pt. Sinergi Asia Corpo", "CP", 8, 1], ["VAST", "Vastland Indonesia", 5010.5, 2, 2.0, 5.95, 69.98, 82.13, 0, 94.1, 94.05, 23, 0, "Pt. Tembesu Elang Perk", "CP", 8, 0], ["SAGE", "Saptausaha Gemilangindah", 5010.1, 2, 2.0, 13.43, 70.0, 82.68, 0, 83.9, 81.29, 23, 0, "Pt. Benteng Terang Sej", "CP", 5, 0], ["MGNA", "Magna Investama Mandiri", 5001.1, 2, 2.0, 5.05, 70.19, 80.45, 10.26, 92.0, 91.12, 7, 0, "Pt Bhuwanatala Indah P", "CP", 13, 1], ["SMMT", "Golden Eagle Energy", 4980.5, 2, 2.01, 5.82, 67.24, 90.9, 0, 94.2, 94.18, 23, 0, "Pt Geo Energy Investam", "CP", 5, 0], ["PGEO", "Pertamina Geothermal Ener", 4947.8, 2, 2.02, 5.95, 68.32, 89.1, 14.85, 94.0, 94.05, 7, 0, "Pertamina Power Indone", "CP", 4, 1], ["DOOH", "Era Media Sejahtera", 4942.1, 2, 2.02, 29.7, 70.3, 70.3, 0, 70.3, 70.3, 18, 1, "Pt. Prambanan Investas", "CP", 1, 0], ["BCIC", "Bank Jtrust Indonesia", 4929.1, 2, 2.03, 3.84, 67.38, 90.9, 94.77, 94.8, 94.77, 15, 0, "J Trust Co Ltd", "CP", 5, 2], ["GRPH", "Griptha Putra Persada", 4926.6, 2, 2.03, 29.81, 70.19, 70.19, 0, 70.2, 70.19, 18, 1, "Pt. Mulia Jaya Palma", "CP", 1, 0], ["BTPS", "Bank Btpn Syariah", 4919.0, 2, 2.03, 22.58, 70.0, 75.6, 7.42, 1.5, 0, 0, 2, "Pt Bank Smbc Indonesia", "IB", 4, 3], ["AYLS", "Agro Yasa Lestari", 4906.2, 2, 2.04, 16.33, 69.69, 78.71, 1.41, 82.3, 82.26, 3, 1, "Pt Bintang Cahaya Inve", "CP", 6, 1], ["TGUK", "Platinum Wahab Nusantara", 4903.6, 2, 2.04, 9.94, 69.33, 81.8, 0, 20.7, 20.73, 20, 1, "Pt Dinasti Kreatif Ind", "OT", 8, 0], ["KEJU", "Mulia Boga Raya", 4889.3, 2, 2.05, 6.08, 66.07, 92.57, 22.5, 93.9, 93.92, 7, 0, "Garudafood Putra Putri", "CP", 4, 1], ["JRPT", "Jaya Real Property", 4874.7, 2, 2.05, 6.99, 67.73, 86.49, 17.6, 74.2, 74.25, 6, 1, "Pt. Pembangunan Jaya", "CP", 8, 2], ["DSFI", "Dharma Samudera Fishing I", 4861.8, 2, 2.06, 23.79, 69.6, 75.02, 0, 74.1, 73.18, 18, 1, "Pt Marina Berkah Inves", "CP", 4, 0], ["DPUM", "Dua Putra Utama Makmur", 4850.8, 2, 2.06, 12.78, 69.2, 77.68, 0, 76.0, 71.23, 22, 0, "Pt Pandawa Putra Inves", "CP", 7, 0], ["ISEA", "Indo American Seafoods", 4849.3, 2, 2.06, 18.82, 69.24, 79.14, 0, 81.2, 81.18, 19, 0, "Indo American Foods", "CP", 4, 0], ["MKTR", "Menthobi Karyatama Raya", 4847.6, 2, 2.06, 3.06, 68.62, 81.14, 1.28, 95.7, 95.66, 13, 0, "Fuad Hasan Masyhur", "ID", 8, 1], ["GGRM", "Gudang Garam", 4843.3, 2, 2.06, 22.0, 69.29, 76.91, 0, 78.0, 78.0, 19, 0, "Suryaduta Investama", "CP", 4, 0], ["JSMR", "Jasa Marga (Persero)", 4834.5, 2, 2.07, 19.79, 69.3, 75.77, 4.52, 74.8, 69.3, 2, 1, "Perusahaan Perseroan (", "CP", 5, 2], ["WEGE", "Wijaya Karya Bangunan Ged", 4826.3, 2, 2.07, 23.8, 69.3, 76.2, 0, 69.3, 69.3, 18, 1, "Perusahaan Perseroan (", "CP", 3, 0], ["KMTR", "Kirana Megatara", 4820.5, 2, 2.07, 0.99, 62.5, 94.93, 69.01, 92.5, 92.5, 15, 0, "Hsf (S) Pte Ltd", "CP", 5, 1], ["HATM", "Habco Trans Maritima", 4819.0, 2, 2.08, 6.36, 66.34, 88.71, 0, 93.6, 93.64, 23, 0, "Pt Habco Primatama", "CP", 6, 0], ["GSMF", "Equity Development Invest", 4786.1, 2, 2.09, 1.34, 68.28, 78.26, 69.78, 98.7, 98.66, 15, 0, "Equity Global Internat", "CP", 10, 2], ["ENZO", "Morenzo Abadi Perkasa", 4777.6, 2, 2.09, 14.03, 68.56, 78.4, 0, 86.0, 85.97, 23, 0, "Tritunggal Sukses Inve", "CP", 5, 0], ["BPTR", "Batavia Prosperindo Trans", 4773.8, 2, 2.09, 5.99, 67.4, 87.88, 4.16, 94.0, 94.01, 7, 0, "Pt. Batavia Prosperind", "CP", 5, 1], ["RATU", "Raharja Energi Cepu", 4764.4, 2, 2.1, 20.91, 68.77, 76.21, 2.45, 79.1, 79.09, 3, 1, "Rukun Raharja Tbk", "CP", 5, 1], ["BBKP", "Bank Kb Indonesia", 4761.3, 2, 2.1, 16.14, 66.88, 83.86, 83.86, 83.9, 83.86, 3, 1, "Kookmin Bank Co. Ltd.", "CP", 2, 2], ["INDR", "Indo-Rama Synthetics", 4758.6, 2, 2.1, 5.51, 64.18, 92.28, 66.39, 25.0, 25.0, 4, 1, "Indorama Holdings B.V.", "OT", 4, 2], ["ITIC", "Indonesian Tobacco", 4756.3, 2, 2.1, 13.3, 68.36, 79.26, 11.32, 79.7, 79.68, 5, 1, "Djonny Saksono", "ID", 7, 2], ["ZATA", "Bersama Zatta Jaya", 4754.1, 2, 2.1, 22.35, 68.71, 76.59, 3.29, 74.4, 74.36, 2, 1, "Lembur Sadaya Investam", "CP", 4, 1], ["POSA", "Bliss Properti Indonesia", 4749.4, 2, 2.11, 11.1, 67.75, 82.14, 0, 71.4, 67.75, 22, 0, "Bintang Baja Hitam Pt", "CP", 7, 0], ["MAPA", "Map Aktif Adiperkasa", 4747.4, 2, 2.11, 25.13, 68.83, 72.46, 4.63, 71.3, 68.83, 2, 1, "Mitra Adiperkasa Tbk", "CP", 5, 2], ["JECC", "Jembo Cable Company", 4733.1, 2, 2.11, 2.16, 66.08, 90.15, 1.32, 87.0, 76.2, 15, 0, "Pt Monaspermata Persad", "CP", 7, 1], ["SDMU", "Sidomulyo Selaras", 4731.2, 2, 2.11, 17.19, 68.12, 78.79, 0, 78.3, 73.7, 16, 1, "Tjoe Mien Sasminto", "ID", 6, 0], ["PWON", "Pakuwon Jati", 4727.9, 2, 2.12, 25.67, 68.68, 72.83, 5.65, 71.5, 68.68, 2, 1, "Pt Pakuwon Arthaniaga", "CP", 4, 3], ["CHEM", "Chemstar Indonesia", 4725.6, 2, 2.12, 18.34, 68.47, 75.36, 0, 81.7, 81.66, 19, 0, "Pt Tunas Bahtera Harum", "CP", 6, 0], ["KLIN", "Klinko Karya Imaji", 4716.1, 2, 2.12, 6.94, 65.56, 90.58, 0, 93.1, 93.06, 23, 0, "Pt. Samico Capital Uta", "CP", 4, 0], ["PAMG", "Bima Sakti Pertiwi", 4712.0, 2, 2.12, 12.09, 68.24, 75.47, 0, 87.9, 87.91, 21, 0, "Christopher Sumasto Tj", "ID", 9, 0], ["BBLD", "Buana Finance", 4682.9, 2, 2.14, 3.92, 67.6, 77.34, 18.87, 80.1, 78.75, 15, 0, "Pt. Sari Dasa Karsa", "CP", 9, 3], ["CITA", "Cita Mineral Investindo", 4676.1, 2, 2.14, 1.4, 60.46, 95.67, 34.54, 64.1, 64.06, 14, 0, "Harita Jayaraya", "CP", 4, 2], ["RAAM", "Tripar Multivsion Plus", 4676.1, 2, 2.14, 9.79, 67.5, 80.99, 13.62, 82.5, 82.5, 5, 1, "Ram Jethmal Punjabi", "ID", 8, 5], ["BREN", "Barito Renewables Energy", 4660.9, 2, 2.15, 6.43, 64.14, 90.4, 29.43, 88.7, 87.07, 7, 0, "Pt Barito Pacific Tbk", "CP", 4, 1], ["CBMF", "Cahaya Bintang Medan", 4657.5, 2, 2.15, 22.67, 67.73, 77.33, 0, 77.3, 77.33, 19, 0, "Richiwa Sakti Indonesi", "CP", 3, 0], ["PTSN", "Sat Nusapersada", 4656.2, 2, 2.15, 3.92, 66.47, 86.47, 24.91, 96.1, 96.08, 13, 0, "Abidin Fan", "ID", 6, 3], ["ALMI", "Alumindo Light Metal Indu", 4656.0, 2, 2.15, 6.39, 65.78, 90.15, 0, 92.6, 92.6, 23, 0, "Pt Husin Investama", "CP", 5, 0], ["EDGE", "Indointernet", 4638.1, 2, 2.16, 0.4, 59.1, 99.6, 99.6, 92.1, 92.1, 15, 0, "Digital Edge (Hong Kon", "CP", 3, 1], ["WINR", "Winner Nusantara Jaya", 4634.9, 2, 2.16, 31.92, 68.08, 68.08, 0, 68.1, 68.08, 18, 1, "Pt. Pemenang Nusantara", "CP", 1, 0], ["OLIV", "Oscar Mitra Sukses Sejaht", 4628.6, 2, 2.16, 27.84, 67.9, 72.16, 0, 72.2, 72.16, 18, 1, "Pt Olive Power Invest", "CP", 2, 0], ["CSIS", "Cahayasakti Investindo Su", 4618.7, 2, 2.17, 15.65, 65.21, 84.35, 0, 84.3, 84.35, 19, 0, "Pt Andalan Utama Binta", "CP", 2, 0], ["WMPP", "Widodo Makmur Perkasa", 4614.3, 2, 2.17, 8.41, 66.95, 80.87, 7.65, 80.5, 80.54, 5, 1, "Tumiyana", "ID", 8, 2], ["SURE", "Super Energy", 4607.6, 2, 2.17, 1.12, 58.87, 97.08, 38.21, 35.2, 35.2, 12, 0, "Pt Super Capital Indon", "OT", 4, 2], ["SICO", "Sigma Energy Compressindo", 4606.1, 2, 2.17, 24.3, 67.58, 75.7, 0, 75.7, 75.7, 19, 0, "Pt. Sigma Energy Utama", "CP", 3, 0], ["LPPS", "Lenox Pasifik Investama", 4603.4, 2, 2.17, 17.05, 67.52, 74.78, 3.3, 79.6, 79.65, 3, 1, "Bank Julius Baer Co. L", "CP", 7, 1], ["EMDE", "Megapolitan Developments", 4574.4, 2, 2.19, 7.93, 66.78, 78.43, 6.9, 84.6, 84.03, 7, 0, "Cosmopolitan Persada D", "CP", 8, 1], ["ALDO", "Alkindo Naratama", 4573.4, 2, 2.19, 4.17, 67.04, 74.32, 0, 95.8, 95.83, 31, 0, "Pt.Golden Arista Inter", "CP", 13, 0], ["SILO", "Siloam International Hosp", 4550.6, 2, 2.2, 6.93, 64.04, 88.16, 64.04, 88.2, 88.16, 7, 0, "Sight Investment Compa", "CP", 5, 1], ["LOPI", "Logisticsplus Internation", 4539.2, 2, 2.2, 19.7, 67.13, 73.6, 0, 80.3, 80.3, 19, 0, "Pt Sentra Amanah Ventu", "CP", 7, 0], ["MCOL", "Prima Andalan Mandiri", 4533.5, 2, 2.21, 5.58, 61.2, 91.2, 0, 94.4, 94.42, 23, 0, "Edika Agung Mandiri Pt", "CP", 5, 0], ["SEMA", "Semacom Integrated", 4526.4, 2, 2.21, 14.1, 66.8, 75.74, 0, 85.9, 85.9, 23, 0, "Pt. Semacom Global Man", "CP", 8, 0], ["MDLA", "Medela Potentia", 4523.8, 2, 2.21, 4.1, 65.94, 82.42, 18.77, 81.8, 78.74, 13, 0, "Hetty Soetikno Dra", "ID", 9, 3], ["MBAP", "Mitrabara Adiperdana", 4520.2, 2, 2.21, 4.09, 60.0, 94.13, 4.13, 91.8, 91.78, 15, 0, "Pt Wahana Sentosa Ceme", "CP", 4, 1], ["INOV", "Inocycle Technology Group", 4519.5, 2, 2.21, 17.6, 66.38, 78.89, 4.02, 78.4, 78.38, 3, 1, "Samudera Industri Pt", "CP", 5, 2], ["PDES", "Destinasi Tirta Nusantara", 4513.9, 2, 2.22, 2.11, 66.15, 79.43, 0, 97.9, 97.89, 31, 0, "Pt Panorama Sentrawisa", "CP", 11, 0], ["CDIA", "Chandra Daya Investasi", 4501.0, 2, 2.22, 9.0, 60.0, 91.0, 31.0, 90.0, 90.0, 7, 0, "Pt Chandra Asri Pacifi", "CP", 3, 2], ["PLAN", "Planet Properindo Jaya", 4493.6, 2, 2.23, 23.85, 66.85, 73.05, 0, 9.3, 9.3, 16, 1, "Wahana Tata Bangun", "OT", 5, 0], ["MBTO", "Martina Berto", 4488.1, 2, 2.23, 23.15, 66.82, 72.66, 0, 6.9, 6.86, 16, 1, "Marthana Megahayu Inti", "OT", 6, 0], ["ISAT", "Indosat", 4479.6, 2, 2.23, 11.37, 65.64, 83.6, 70.67, 21.3, 19.58, 4, 1, "Ooredoo Hutchison Asia", "OT", 6, 4], ["HITS", "Humpuss Intermoda Transpo", 4447.2, 2, 2.25, 0.08, 50.57, 97.72, 0, 99.9, 99.92, 31, 0, "Pt Investa Dharma Pute", "CP", 4, 0], ["HDFA", "Radana Bhaskara Finance", 4442.4, 2, 2.25, 3.26, 55.23, 95.67, 58.52, 38.2, 38.22, 12, 0, "Rubicon Investments Ho", "OT", 4, 1], ["HERO", "Dfi Retail Nusantara", 4434.6, 2, 2.25, 3.33, 63.59, 89.3, 10.63, 7.4, 7.37, 12, 0, "Mulgrave Corporation B", "OT", 6, 2], ["SGRO", "Prime Agri Resources", 4434.3, 2, 2.26, 9.23, 65.72, 75.69, 76.94, 90.8, 90.77, 7, 0, "Agpa Pte. Ltd.", "CP", 7, 3], ["TCID", "Mandom Indonesia", 4414.3, 2, 2.27, 12.9, 65.23, 81.19, 65.23, 74.1, 74.11, 6, 1, "Mandom Corporation", "CP", 7, 1], ["ESTA", "Esta Multi Usaha", 4395.0, 2, 2.28, 4.72, 62.61, 90.56, 20.17, 67.3, 67.33, 14, 0, "Pt. Esta Utama Corpora", "CP", 6, 1], ["LCKM", "Lck Global Kedaton", 4389.3, 2, 2.28, 8.02, 62.78, 87.7, 4.74, 92.0, 91.98, 7, 0, "Pt Lck Investama Prima", "CP", 4, 1], ["JATI", "Informasi Teknologi Indon", 4382.5, 2, 2.28, 12.56, 64.0, 84.9, 0, 7.4, 7.44, 20, 1, "Pt Jati Piranti Solusi", "OT", 4, 0], ["BEKS", "Bank Pembangunan Daerah B", 4372.1, 2, 2.29, 32.65, 66.11, 67.35, 0, 67.3, 67.35, 18, 1, "Banten Global Developm", "CP", 2, 0], ["SUNI", "Sunindo Pratama", 4370.0, 2, 2.29, 5.12, 64.6, 80.26, 11.96, 94.9, 94.88, 5, 0, "Soe To Tie Lin", "ID", 8, 1], ["PZZA", "Sarimelati Kencana", 4358.8, 2, 2.29, 12.86, 64.79, 81.39, 20.78, 73.4, 73.36, 6, 1, "Sriboga Raturaya Pt", "CP", 5, 3], ["SWID", "Saraswanti Indoland Devel", 4349.3, 2, 2.3, 3.44, 63.52, 83.62, 0, 33.0, 33.04, 28, 0, "Pt Saraswanti Utama", "OT", 7, 0], ["PTBA", "Bukit Asam", 4349.1, 2, 2.3, 32.53, 65.93, 67.47, 0, 66.7, 65.93, 18, 1, "Perusahaan Perseroan (", "CP", 2, 0], ["BKSL", "Sentul City", 4342.8, 2, 2.3, 18.03, 65.27, 77.48, 1.16, 75.3, 75.3, 3, 1, "Pt Sakti Generasi Perd", "CP", 6, 1], ["PPRO", "Pp Properti", 4331.8, 2, 2.31, 18.08, 64.96, 79.27, 0, 8.7, 1.57, 16, 1, "Pt Pp Persero Tbk", "OT", 5, 0], ["HAJJ", "Arsy Buana Travelindo", 4315.0, 2, 2.32, 10.8, 64.96, 75.58, 0, 89.2, 89.2, 23, 0, "Pt Madinah Iman Wisata", "CP", 9, 0], ["MDKI", "Emdeki Utama", 4305.2, 2, 2.32, 12.77, 65.08, 72.95, 1.38, 78.1, 78.08, 7, 0, "Emde Industri Investam", "CP", 9, 1], ["LPGI", "Lippo General Insurance", 4299.2, 2, 2.33, 2.64, 61.5, 92.46, 61.5, 60.2, 23.0, 12, 0, "Hanwha General Insuran", "IS", 4, 1], ["APLI", "Asiaplast Industries", 4296.2, 2, 2.33, 5.45, 58.8, 92.17, 0, 94.5, 94.55, 23, 0, "Pt Maco Amangraha", "CP", 5, 0], ["CMPP", "Airasia Indonesia", 4283.8, 2, 2.33, 3.85, 46.25, 96.15, 46.25, 92.4, 92.41, 13, 0, "Airasia Aviation Group", "CP", 3, 1], ["PSAT", "Pancaran Samudera Transpo", 4260.5, 2, 2.35, 8.75, 60.35, 87.3, 0, 91.2, 91.25, 23, 0, "Profitama Hasil Indah", "CP", 6, 0], ["VICI", "Victoria Care Indonesia", 4250.9, 2, 2.35, 4.88, 59.95, 89.59, 25.0, 95.1, 95.12, 15, 0, "Pt. Sukses Sejati Seja", "CP", 6, 1], ["MIKA", "Mitra Keluarga Karyasehat", 4249.0, 2, 2.35, 13.1, 64.65, 71.89, 2.43, 84.5, 84.47, 7, 0, "Pt Griya Insani Cakra ", "CP", 9, 1], ["ITMG", "Indo Tambangraya Megah", 4248.9, 2, 2.35, 30.8, 65.14, 68.15, 66.82, 67.8, 66.47, 2, 1, "Banpu Minerals (Singap", "CP", 4, 2], ["BLTZ", "Graha Layar Prima", 4235.1, 2, 2.36, 0.74, 51.0, 95.26, 99.26, 0.0, 0, 12, 0, "Cgi Holdings Limited", "OT", 4, 3], ["CASS", "Cahaya Aero Services", 4231.6, 2, 2.36, 5.74, 61.0, 88.3, 27.61, 88.8, 88.3, 7, 0, "Roket Cipta Sentosa Pt", "CP", 7, 3], ["TINS", "Timah", 4231.1, 2, 2.36, 30.77, 65.0, 68.12, 1.11, 1.6, 0, 0, 2, "Pt Mineral Industri In", "OT", 4, 1], ["ANTM", "Aneka Tambang", 4225.0, 2, 2.37, 35.0, 65.0, 65.0, 0, 65.0, 65.0, 18, 1, "Perusahaan Perseroan (", "CP", 1, 0], ["LUCY", "Lima Dua Lima Tiga", 4190.3, 2, 2.39, 6.26, 59.42, 87.73, 0, 93.7, 93.74, 23, 0, "Pt Delta Wibawa Bersam", "CP", 7, 0], ["SKRN", "Superkrane Mitra Utama", 4161.3, 2, 2.4, 1.89, 59.75, 88.17, 5.07, 98.1, 98.11, 15, 0, "Pt Saga Investama Seda", "CP", 8, 2], ["BRAM", "Indo Kordsa", 4150.3, 2, 2.41, 1.1, 61.59, 83.77, 63.58, 98.9, 98.9, 15, 0, "Kordsa Teknik Tekstil ", "CP", 8, 2], ["DART", "Duta Anggada Realty", 4145.5, 2, 2.41, 4.83, 46.65, 92.43, 2.83, 92.3, 92.34, 13, 0, "Hartadi Angkosubroto", "ID", 5, 2], ["NRCA", "Nusa Raya Cipta", 4145.3, 2, 2.41, 19.11, 63.94, 72.38, 0, 80.9, 80.89, 19, 0, "Pt Surya Semesta Inter", "CP", 8, 0], ["ZBRA", "Dosni Roha Indonesia", 4145.2, 2, 2.41, 7.24, 62.01, 82.09, 4.66, 72.7, 72.68, 6, 1, "Pt Trinity Healthcare", "CP", 6, 1], ["PYFA", "Pyridam Farma", 4144.8, 2, 2.41, 23.64, 64.02, 72.31, 67.21, 67.6, 65.07, 2, 1, "Rejuve Global Investme", "CP", 5, 1], ["DOSS", "Global Sukses Digital", 4144.0, 2, 2.41, 11.46, 62.97, 80.19, 4.28, 84.3, 84.26, 7, 0, "Pt Sukses Investama In", "CP", 6, 1], ["TLDN", "Teladan Prima Agro", 4124.0, 2, 2.42, 4.19, 59.88, 92.32, 3.49, 92.3, 92.32, 15, 0, "Pt Teladan Resources", "CP", 4, 1], ["DLTA", "Delta Djakarta", 4108.1, 2, 2.43, 10.18, 58.33, 88.41, 62.16, 60.9, 58.33, 6, 1, "San Miguel Malaysia (L", "CP", 4, 2], ["STRK", "Lovina Beach Brewery", 4101.9, 2, 2.44, 12.76, 61.87, 81.13, 16.99, 70.2, 70.25, 6, 1, "Barito Mas Sukses", "CP", 8, 1], ["AKRA", "Akr Corporindo", 4087.3, 2, 2.45, 24.31, 63.71, 69.97, 9.56, 69.4, 66.13, 2, 1, "Pt Arthakencana Rayata", "CP", 7, 4], ["EMAS", "Merdeka Gold Resources", 4066.4, 2, 2.46, 13.58, 63.33, 70.81, 8.83, 81.8, 80.19, 7, 0, "Merdeka Copper Gold Tb", "CP", 13, 4], ["AHAP", "Asuransi Harta Aman Prata", 4057.8, 2, 2.46, 22.09, 62.58, 76.6, 3.76, 46.0, 14.02, 0, 2, "Pt Asuransi Central As", "IS", 4, 2], ["BOLT", "Garuda Metalindo", 4046.6, 2, 2.47, 6.1, 61.65, 80.37, 12.17, 88.0, 87.98, 7, 0, "Pt Garuda Multi Invest", "CP", 8, 2], ["NAYZ", "Hassana Boga Sejahtera", 4037.9, 2, 2.48, 14.13, 62.0, 78.11, 3.15, 84.3, 82.72, 7, 0, "Pt. Asia Intrainvesta", "CP", 7, 1], ["SBMA", "Surya Biru Murni Acetylen", 4036.3, 2, 2.48, 22.63, 62.91, 74.6, 0, 14.5, 14.46, 16, 1, "Pt Surya Biru Titilea ", "OT", 4, 0], ["IRSX", "Folago Global Nusantara", 4035.3, 2, 2.48, 30.92, 63.44, 67.42, 0, 69.1, 69.08, 18, 1, "Pt Matra Tri Abadi", "CP", 4, 0], ["SAFE", "Steady Safe", 4034.0, 2, 2.48, 5.59, 56.57, 91.89, 27.83, 65.5, 65.47, 6, 1, "Infiniti Wahana Pt", "CP", 5, 1], ["DSSA", "Dian Swastatika Sentosa", 4022.0, 2, 2.49, 7.63, 59.9, 83.72, 12.79, 79.6, 79.58, 7, 0, "Pt Sinar Mas Tunggal", "CP", 6, 3], ["IPTV", "Mnc Vision Networks", 4016.2, 2, 2.49, 16.13, 62.77, 72.54, 16.46, 70.9, 70.92, 2, 1, "Pt Global Mediacom Tbk", "CP", 9, 5], ["ASLI", "Asri Karya Lestari", 3989.3, 2, 2.51, 20.17, 62.72, 71.24, 0, 79.8, 79.83, 19, 0, "Pt Wahana Konstruksi M", "CP", 8, 0], ["BIPP", "Bhuwanatala Indah Permai", 3965.3, 2, 2.52, 12.95, 61.62, 77.44, 63.85, 87.0, 87.05, 7, 0, "Safire Capital Pte.Ltd", "CP", 8, 2], ["VOKS", "Voksel Electric", 3962.3, 2, 2.52, 0.9, 54.67, 89.72, 84.75, 69.0, 69.02, 14, 0, "Hengtong Optic Electri", "CP", 5, 1], ["FWCT", "Wijaya Cahaya Timber", 3939.7, 2, 2.54, 18.12, 58.08, 81.88, 23.8, 81.9, 81.88, 3, 1, "Fortuna Anugrah Sumber", "CP", 2, 1], ["BBHI", "Allo Bank Indonesia", 3937.3, 2, 2.54, 7.41, 60.88, 79.37, 10.1, 92.6, 92.59, 7, 0, "Pt Mega Corpora", "CP", 8, 3], ["POLY", "Asia Pacific Fibers", 3932.7, 2, 2.54, 24.57, 62.42, 69.03, 64.75, 72.8, 72.78, 2, 1, "Damiano Investments B.", "CP", 6, 2], ["CHEK", "Diastika Biotekindo", 3926.8, 2, 2.55, 16.71, 60.5, 79.09, 6.98, 83.3, 83.29, 3, 1, "Optel Investama Mulia", "CP", 5, 3], ["OPMS", "Optima Prima Metal Sinerg", 3913.4, 2, 2.56, 21.81, 59.79, 78.19, 0, 78.2, 78.19, 19, 0, "Asian Perkasa Indostee", "CP", 2, 0], ["DMAS", "Puradelta Lestari", 3909.1, 2, 2.56, 15.95, 57.28, 84.05, 0, 58.2, 57.28, 18, 1, "Pt Sumber Arusmulia", "CP", 3, 0], ["CBRE", "Cakra Buana Resources Ene", 3891.8, 2, 2.57, 21.14, 61.13, 77.45, 0, 78.9, 78.86, 19, 0, "Pt Omudas Investment H", "CP", 4, 0], ["GHON", "Gihon Telekomunikasi Indo", 3890.9, 2, 2.57, 1.01, 50.43, 91.49, 0, 99.0, 98.99, 31, 0, "Tower Bersama Infrastr", "CP", 6, 0], ["AMOR", "Ashmore Asset Management ", 3876.8, 2, 2.58, 8.51, 60.04, 79.39, 60.04, 90.4, 90.42, 7, 0, "Ashmore Investment Man", "CP", 6, 1], ["PALM", "Provident Investasi Bersa", 3876.2, 2, 2.58, 2.49, 58.02, 85.71, 4.64, 97.5, 97.51, 15, 0, "Pt Provident Capital I", "CP", 6, 1], ["DKFT", "Central Omega Resources", 3870.2, 2, 2.58, 18.09, 61.63, 71.19, 2.6, 79.3, 79.31, 3, 1, "Pt Jinsheng Mining", "CP", 8, 1], ["AXIO", "Tera Data Indonusa", 3866.1, 2, 2.59, 7.23, 59.25, 81.44, 0, 92.8, 92.77, 23, 0, "Pt Exa Nusa Persada", "CP", 8, 0], ["POLI", "Pollux Hotels Group", 3850.8, 2, 2.6, 0.28, 56.95, 84.34, 3.91, 95.8, 95.81, 13, 0, "Po Sun Kok", "ID", 7, 1], ["BUVA", "Bukit Uluwatu Villa", 3848.9, 2, 2.6, 19.59, 61.64, 68.51, 6.47, 78.8, 78.82, 3, 1, "Nusantara Utama Invest", "CP", 9, 2], ["PNSE", "Pudjiadi And Sons", 3783.4, 2, 2.64, 4.67, 55.7, 87.34, 0, 95.3, 95.33, 31, 0, "Pt. Istana Kuta Ratu P", "CP", 9, 0], ["KSIX", "Kentanix Supra Internatio", 3777.6, 2, 2.65, 1.21, 58.84, 81.29, 0, 98.8, 98.79, 31, 0, "Pt Badra Arta", "CP", 8, 0], ["MCOR", "Bank China Construction B", 3766.8, 2, 2.65, 10.04, 60.0, 74.83, 74.5, 75.5, 75.46, 7, 0, "China Construction Ban", "CP", 8, 3], ["JKON", "Jaya Konstruksi Manggala ", 3760.6, 2, 2.66, 16.96, 60.89, 67.71, 2.41, 74.7, 74.72, 2, 1, "Pt. Pembangunan Jaya", "CP", 12, 1], ["UCID", "Uni-Charm Indonesia", 3758.7, 2, 2.66, 10.54, 59.2, 80.0, 9.46, 25.3, 24.39, 4, 1, "Unicharm Corporation", "OT", 8, 5], ["PMUI", "Prima Multi Usaha Indones", 3749.5, 2, 2.67, 6.43, 56.0, 84.19, 0, 92.5, 92.51, 21, 0, "Rudy Susanto Wijaya Ka", "ID", 8, 0], ["GWSA", "Greenwood Sejahtera", 3746.1, 2, 2.67, 7.05, 56.25, 84.2, 0, 90.6, 88.24, 23, 0, "Prima Permata Sejahter", "CP", 7, 0], ["MYOH", "Samindo Resources", 3745.6, 2, 2.67, 6.72, 59.03, 77.74, 62.27, 29.8, 25.44, 4, 1, "St International Corpo", "OT", 10, 1], ["PMJS", "Putra Mandiri Jembar", 3742.3, 2, 2.67, 1.14, 50.24, 91.04, 34.0, 40.8, 39.74, 12, 0, "Pt. Pahalamas Sejahter", "OT", 7, 1], ["MGRO", "Mahkota Group", 3739.9, 2, 2.67, 6.82, 56.4, 84.14, 29.08, 88.2, 88.23, 7, 0, "Pt Mahkota Global Inve", "CP", 9, 3], ["MERI", "Merry Riana Edukasi", 3732.6, 2, 2.68, 22.72, 57.96, 77.28, 0, 77.3, 77.28, 19, 0, "Merry Riana Indonesia", "CP", 2, 0], ["TOBA", "Tbs Energi Utama", 3729.3, 2, 2.68, 23.21, 60.36, 72.29, 60.36, 76.8, 76.79, 3, 1, "Highland Strategic Hol", "CP", 6, 1], ["LAJU", "Jasa Berdikari Logistics", 3728.7, 2, 2.68, 32.57, 60.69, 67.43, 0, 0.0, 0, 16, 1, "Ervin Niaga Abadi Pt", "OT", 2, 0], ["AMFG", "Asahimas Flat Glass", 3724.7, 2, 2.68, 8.74, 44.53, 88.06, 46.43, 89.4, 89.36, 5, 1, "Agc Inc.", "CP", 5, 2], ["TUGU", "Asuransi Tugu Pratama Ind", 3718.1, 2, 2.69, 16.25, 58.5, 79.63, 25.25, 65.3, 62.62, 2, 1, "Pt Pertamina (Persero)", "CP", 4, 3], ["MMIX", "Multi Medika Internasiona", 3717.0, 2, 2.69, 9.01, 59.99, 71.99, 0, 91.0, 90.99, 23, 0, "Pt. Multi Inti Usaha", "CP", 12, 0], ["NPGF", "Nusa Palapa Gemilang", 3715.7, 2, 2.69, 17.53, 56.01, 81.27, 0, 82.5, 82.47, 19, 0, "Pt Atmaja Makmur Gemil", "CP", 4, 0], ["NICK", "Charnic Capital", 3711.9, 2, 2.69, 1.5, 57.6, 79.95, 14.16, 84.3, 84.34, 15, 0, "Pt. Indovest Central", "CP", 9, 2], ["BSIM", "Bank Sinar Mas", 3700.4, 2, 2.7, 5.03, 59.99, 68.61, 14.33, 82.0, 80.64, 7, 0, "Pt Sinar Mas Multiarth", "CP", 15, 3], ["TCPI", "Transcoal Pacific", 3690.4, 2, 2.71, 3.98, 55.0, 83.2, 4.96, 33.4, 33.36, 12, 0, "Sari Nusantara Gemilan", "OT", 9, 2], ["CMNP", "Citra Marga Nusaphala Per", 3687.4, 2, 2.71, 2.26, 59.35, 69.35, 64.31, 38.4, 38.39, 12, 0, "Bp2S Sg/Bnp Paribas Si", "OT", 11, 2], ["AISA", "Fks Food Sejahtera", 3670.6, 2, 2.72, 19.08, 58.47, 75.81, 5.15, 78.3, 77.39, 3, 1, "Pt. Pangan Sejahtera I", "CP", 6, 2], ["BALI", "Bali Towerindo Sentra", 3667.5, 2, 2.73, 4.73, 59.7, 69.13, 11.82, 73.7, 72.22, 14, 0, "Pt Kharisma Cipta Towe", "CP", 16, 3], ["TKIM", "Pabrik Kertas Tjiwi Kimia", 3658.1, 2, 2.73, 14.5, 59.67, 69.38, 16.48, 64.0, 64.0, 6, 1, "App Purinusa Ekapersad", "CP", 9, 3], ["APII", "Arita Prima Indonesia", 3641.9, 2, 2.75, 3.22, 57.84, 77.48, 19.3, 66.2, 66.22, 14, 0, "Arita GlobalPt", "CP", 9, 3], ["CLEO", "Sariguna Primatirta", 3629.7, 2, 2.76, 11.62, 56.12, 81.32, 0, 88.4, 88.38, 23, 0, "Pt. Tancorp Global Aba", "CP", 6, 0], ["HOKI", "Buyung Poetra Sembada", 3629.6, 2, 2.76, 34.08, 59.95, 65.92, 0, 65.9, 65.92, 18, 1, "Pt Buyung Investama Ge", "CP", 2, 0], ["BMSR", "Bintang Mitra Semestaraya", 3629.3, 2, 2.76, 6.04, 59.11, 68.41, 76.91, 27.8, 26.22, 4, 1, "Chance Stand Finance L", "OT", 11, 3], ["MPIX", "Mitra Pedagang Indonesia", 3629.2, 2, 2.76, 30.23, 60.0, 66.57, 0, 69.8, 69.77, 18, 1, "Pt Madura Prima Invest", "CP", 5, 0], ["WTON", "Wijaya Karya Beton", 3628.1, 2, 2.76, 30.37, 60.0, 66.85, 0, 62.1, 60.0, 18, 1, "Perusahaan Perseroan (", "CP", 5, 0], ["CHIP", "Pelita Teknologi Global", 3624.2, 2, 2.76, 16.52, 59.61, 67.13, 0, 83.5, 83.48, 19, 0, "Karya Permata Berkat J", "CP", 11, 0], ["TRON", "Teknologi Karya Digital N", 3622.8, 2, 2.76, 24.17, 59.77, 67.92, 3.57, 75.8, 75.83, 3, 1, "Daya Kemilau Nusantara", "CP", 7, 1], ["ACES", "Aspirasi Hidup Indonesia", 3614.2, 2, 2.77, 32.31, 60.0, 64.27, 6.62, 60.5, 60.0, 2, 1, "Pt Kawan Lama Sejahter", "CP", 6, 4], ["CNMA", "Nusantara Sejahtera Raya", 3610.1, 2, 2.77, 6.53, 53.99, 90.0, 23.94, 93.5, 93.47, 7, 0, "Pt. Harkatjaya Bumiper", "CP", 5, 2], ["INTD", "Inter Delta", 3607.4, 2, 2.77, 7.04, 54.74, 87.04, 54.74, 92.0, 91.95, 7, 0, "Peak Aim Development L", "CP", 8, 1], ["SPMA", "Suparma", 3605.2, 2, 2.77, 6.39, 49.98, 92.14, 0, 93.6, 93.61, 21, 0, "Pt Pacific Star Synerg", "CP", 4, 0], ["KETR", "Ketrosden Triasmitra", 3598.3, 2, 2.78, 21.84, 56.53, 78.16, 0, 78.2, 78.16, 19, 0, "Pt Fajar Sejahtera Man", "CP", 3, 0], ["AMIN", "Ateliers Mecaniques D`Ind", 3596.2, 2, 2.78, 10.03, 58.39, 75.5, 82.68, 88.9, 88.87, 7, 0, "Sphere Corporation Sdn", "CP", 10, 4], ["ZYRX", "Zyrexindo Mandiri Buana", 3593.6, 2, 2.78, 8.96, 56.41, 80.06, 0, 91.0, 91.04, 21, 0, "Timothy Siddik Shu", "ID", 7, 0], ["LSIP", "Pp London Sumatra Indones", 3590.2, 2, 2.79, 27.43, 59.51, 67.95, 0, 68.7, 64.75, 18, 1, "Pt Salim Ivomas Pratam", "CP", 5, 0], ["GEMS", "Golden Energy Mines", 3582.2, 2, 2.79, 1.85, 51.0, 87.99, 6.99, 98.2, 98.15, 15, 0, "Pt Dian Swastatika Sen", "CP", 7, 1], ["UNTR", "United Tractors", 3577.8, 2, 2.8, 30.26, 59.5, 67.56, 2.18, 66.7, 64.68, 2, 1, "Pt Astra International", "CP", 5, 2], ["MEDS", "Hetzer Medical Indonesia", 3576.8, 2, 2.8, 33.72, 59.67, 64.93, 0, 66.3, 66.28, 16, 1, "Jemmy Kurniawan", "ID", 4, 0], ["TRGU", "Cerestar Indonesia", 3566.2, 2, 2.8, 6.03, 51.05, 86.07, 12.85, 94.0, 93.97, 7, 0, "Sunterra Indonesia Pt", "CP", 5, 1], ["ABMM", "Abm Investama", 3563.3, 2, 2.81, 11.81, 53.56, 84.69, 29.01, 88.2, 88.19, 7, 0, "Pt Tiara Marga Trakind", "CP", 4, 2], ["PBSA", "Paramita Bangun Sarana", 3561.6, 2, 2.81, 9.41, 46.16, 87.7, 5.65, 84.9, 84.94, 5, 1, "Pt Ascend Bangun Persa", "CP", 5, 1], ["TRIL", "Triwira Insanlestari", 3545.3, 2, 2.82, 17.83, 57.54, 75.98, 4.01, 78.2, 78.16, 3, 1, "Pt Arthabuana Karya Ma", "CP", 7, 1], ["SRIL", "Sri Rejeki Isman", 3542.8, 2, 2.82, 25.3, 59.03, 67.95, 14.65, 72.6, 72.56, 2, 1, "Pt Huddleston Indonesi", "CP", 6, 2], ["LRNA", "Eka Sari Lorena Transport", 3539.2, 2, 2.83, 6.85, 57.14, 77.66, 0, 93.2, 93.15, 23, 0, "Lorena", "CP", 8, 0], ["MEGA", "Bank Mega", 3530.3, 2, 2.83, 1.64, 58.02, 67.66, 4.35, 94.0, 89.6, 15, 0, "Pt Mega Corpora", "CP", 12, 2], ["CTBN", "Citra Tubindo", 3529.2, 2, 2.83, 0.54, 48.23, 88.68, 99.46, 96.2, 96.17, 13, 0, "Kestrel Wave Investmen", "CP", 7, 5], ["INET", "Sinergi Inti Andalan Prim", 3526.0, 2, 2.84, 40.62, 59.38, 59.38, 0, 59.4, 59.38, 18, 1, "Pt Abadi Kreasi Unggul", "CP", 1, 0], ["PRDA", "Prodia Widyahusada", 3525.8, 2, 2.84, 14.2, 57.0, 77.09, 18.06, 66.4, 62.09, 6, 1, "Pt. Prodia Utama", "CP", 7, 3], ["SOLA", "Xolare Rcr Energy", 3513.3, 2, 2.85, 17.29, 57.8, 75.09, 0, 82.7, 82.71, 19, 0, "Energi Hijau Investama", "CP", 6, 0], ["PNBN", "Bank Pan Indonesia", 3487.8, 2, 2.87, 11.59, 44.43, 84.86, 38.82, 88.4, 88.41, 5, 1, "Pt. Panin Financial Tb", "CP", 6, 1], ["JMAS", "Asuransi Jiwa Syariah Jas", 3476.3, 2, 2.88, 13.53, 57.95, 70.41, 0, 22.7, 19.79, 20, 1, "Koperasi Simpan Pinjam", "OT", 12, 0], ["BLOG", "Trimitra Trans Persada", 3462.6, 2, 2.89, 9.67, 50.83, 83.33, 0, 90.3, 90.33, 23, 0, "Pt Sigmantara Alfindo", "CP", 6, 0], ["KMDS", "Kurniamitra Duta Sentosa", 3460.3, 2, 2.89, 8.81, 55.0, 79.02, 5.65, 91.2, 91.19, 7, 0, "Pt Dima Investindo", "CP", 9, 2], ["ISSP", "Steel Pipe Industry Of In", 3458.1, 2, 2.89, 10.84, 57.69, 69.42, 10.72, 80.6, 80.61, 7, 0, "Pt Cakra Bhakti Para P", "CP", 11, 2], ["AMMS", "Agung Menjangan Mas", 3452.3, 2, 2.9, 15.95, 51.0, 83.04, 51.0, 84.0, 84.05, 3, 1, "Radiant Ruby Company L", "CP", 4, 1], ["CRSN", "Carsurin", 3449.7, 2, 2.9, 3.47, 50.04, 84.51, 0, 96.5, 96.53, 29, 0, "Sheila Maria Tiwan", "ID", 7, 0], ["ENAK", "Champ Resto Indonesia", 3438.5, 2, 2.91, 4.02, 54.52, 82.4, 58.57, 91.9, 91.93, 15, 0, "Barokah Melayu Food Pt", "CP", 6, 1], ["ULTJ", "Ultrajaya Milk Industry A", 3429.1, 2, 2.92, 10.36, 53.17, 80.56, 0, 84.0, 82.0, 21, 0, "Sabana Prawira Widjaja", "ID", 7, 0], ["GLVA", "Galva Technologies", 3427.8, 2, 2.92, 2.45, 57.32, 66.89, 19.63, 75.1, 75.12, 15, 0, "Pt. Elsiscom Prima Kar", "CP", 14, 2], ["BRIS", "Bank Syariah Indonesia", 3427.4, 2, 2.92, 8.66, 51.47, 90.09, 1.25, 0.6, 0, 4, 1, "Pt Bank Mandiri", "IB", 4, 1], ["TIRA", "Tira Austenite", 3426.7, 2, 2.92, 4.49, 44.12, 85.96, 0, 95.5, 95.51, 29, 0, "Pt Widjajatunggal Seja", "CP", 7, 0], ["SHIP", "Sillo Maritime Perdana", 3418.6, 2, 2.93, 5.69, 44.85, 86.57, 4.4, 89.9, 89.91, 5, 1, "Pt Goldenheaven Prima ", "CP", 5, 1], ["STTP", "Siantar Top", 3416.8, 2, 2.93, 5.59, 56.76, 70.59, 4.33, 90.1, 90.08, 7, 0, "Shindo Tiara Tunggal", "CP", 10, 1], ["RALS", "Ramayana Lestari Sentosa", 3416.0, 2, 2.93, 18.58, 55.88, 75.95, 1.11, 80.3, 80.31, 3, 1, "Pt. Ramayana Lestari S", "CP", 6, 1], ["BMHS", "Bundamedik", 3386.6, 2, 2.95, 12.69, 57.37, 65.97, 13.21, 87.3, 87.31, 7, 0, "Pt. Bunda Investama In", "CP", 12, 3], ["MPMX", "Mitra Pinasthika Mustika", 3376.1, 2, 2.96, 25.27, 57.67, 66.08, 4.35, 71.0, 68.24, 2, 1, "Saratoga Investama Sed", "CP", 9, 2], ["OCAP", "Onix Capital", 3366.1, 2, 2.97, 1.92, 45.0, 88.0, 45.0, 53.1, 53.08, 12, 0, "Uob Kay Hian (Hong Kon", "SC", 5, 1], ["SMDR", "Samudera Indonesia", 3364.0, 2, 2.97, 24.52, 56.08, 72.51, 0, 2.5, 1.92, 16, 1, "Samudera Indonesia Tan", "OT", 5, 0], ["PPGL", "Prima Globalindo Logistik", 3362.4, 2, 2.97, 15.7, 53.12, 79.46, 0, 84.3, 84.3, 17, 1, "Darmawan Suryadi Sm", "ID", 6, 0], ["SSTM", "Sunson Textile Manufactur", 3360.8, 2, 2.98, 8.13, 40.99, 83.72, 0, 48.1, 48.14, 20, 1, "Sunsonindo Textile Inv", "OT", 9, 0], ["RMKE", "Rmk Energy", 3359.6, 2, 2.98, 9.26, 56.8, 65.96, 0, 90.7, 90.74, 23, 0, "Pt Rmk Investama", "CP", 11, 0], ["KOCI", "Kokoh Exa Nusantara", 3351.0, 2, 2.98, 9.05, 49.33, 83.84, 0, 91.0, 90.95, 21, 0, "Pt Exa Nusa Persada", "CP", 6, 0], ["MAIN", "Malindo Feedmill", 3347.5, 2, 2.99, 17.67, 57.27, 65.73, 72.23, 75.3, 75.34, 3, 1, "Dragon Amity Pte Ltd", "CP", 13, 2], ["IBFN", "Intan Baru Prana", 3344.3, 2, 2.99, 19.69, 55.07, 75.01, 2.71, 79.6, 78.99, 3, 1, "Pt. Intraco Penta . Tb", "CP", 7, 1], ["WIDI", "Widiant Jaya Krenindo", 3341.0, 2, 2.99, 40.32, 57.77, 59.68, 0, 59.7, 59.68, 16, 1, "Bernard Widianto", "ID", 2, 0], ["TOTL", "Total Bangun Persada", 3340.6, 2, 2.99, 21.77, 56.5, 70.77, 4.32, 74.5, 73.91, 2, 1, "Total Inti Persada", "CP", 7, 2], ["IFSH", "Ifishdeco", 3338.2, 2, 3.0, 0.84, 40.8, 89.5, 0, 58.4, 58.36, 28, 0, "Pt Fajar Mining Resour", "OT", 5, 0], ["IFII", "Indonesia Fibreboard Indu", 3326.7, 2, 3.01, 0.62, 51.0, 81.98, 32.44, 99.4, 99.38, 15, 0, "Adrindo Intiperkasa P", "CP", 8, 1], ["LTLS", "Lautan Luas", 3322.1, 2, 3.01, 10.16, 56.59, 67.5, 14.44, 86.0, 85.99, 7, 0, "Jpmcb Na Re-Pt Caturka", "CP", 12, 2], ["PORT", "Nusantara Pelabuhan Handa", 3304.7, 2, 3.03, 0.41, 51.0, 80.59, 70.0, 94.6, 94.61, 15, 0, "China Merchants Intern", "CP", 7, 3], ["BNII", "Bank Maybank Indonesia", 3303.7, 2, 3.03, 1.48, 45.02, 87.71, 97.29, 98.5, 98.52, 13, 0, "Sorak Financial Holdin", "CP", 6, 2], ["BSSR", "Baramulti Suksessarana", 3295.9, 2, 3.03, 9.26, 50.0, 85.74, 35.74, 90.7, 90.74, 5, 0, "Pt Wahana Sentosa Ceme", "CP", 4, 2], ["SONA", "Sona Topas Tourism Indust", 3295.7, 2, 3.03, 1.7, 45.0, 92.35, 49.53, 93.8, 93.77, 13, 0, "Dfs Venture Singapore ", "CP", 5, 2], ["GOLD", "Visi Telekomunikasi Infra", 3260.6, 2, 3.07, 1.46, 51.09, 81.49, 4.95, 90.5, 90.5, 15, 0, "Tower Bersama Infrastr", "CP", 7, 1], ["PGAS", "Perusahaan Gas Negara (Pe", 3257.4, 2, 3.07, 36.11, 56.96, 61.26, 1.27, 60.2, 58.23, 2, 1, "Pt Pertamina (Persero)", "CP", 5, 1], ["DATA", "Remala Abadi", 3238.3, 2, 3.09, 13.28, 40.09, 85.54, 0, 86.7, 86.72, 21, 0, "Verah Wahyudi S Wong", "ID", 4, 0], ["PRAY", "Famon Awal Bros Sedaya", 3227.4, 2, 3.1, 1.52, 46.47, 90.96, 34.67, 93.8, 93.76, 13, 0, "Pt. Famon Obor Maju", "CP", 5, 1], ["NZIA", "Nusantara Almazia", 3226.1, 2, 3.1, 5.66, 44.5, 83.84, 0, 15.3, 15.35, 20, 1, "Richard Rachmadi Wiria", "OT", 7, 0], ["SSMS", "Sawit Sumbermas Sarana", 3223.7, 2, 3.1, 5.81, 53.75, 77.25, 15.92, 83.5, 83.45, 7, 0, "Pt.Citra Borneo Indah", "CP", 9, 3], ["ADMG", "Polychem Indonesia", 3222.9, 2, 3.1, 9.54, 49.51, 85.49, 50.54, 40.9, 40.95, 4, 1, "Provestment Limited", "OT", 6, 2], ["PSGO", "Palma Serasih", 3221.3, 2, 3.1, 1.17, 43.4, 86.9, 8.74, 92.7, 92.74, 13, 0, "Pt Jalinankasih Sesama", "CP", 7, 2], ["BSBK", "Wulandari Bangun Laksana", 3221.2, 2, 3.1, 9.96, 39.85, 84.93, 0, 90.0, 90.04, 21, 0, "Clarissa Ady Sumasto T", "ID", 5, 0], ["MANG", "Manggung Polahraya", 3215.5, 2, 3.11, 9.63, 54.56, 73.18, 0, 90.4, 90.37, 21, 0, "Mohamad Reza Pahlevi", "ID", 10, 0], ["CPIN", "Charoen Pokphand Indonesi", 3214.4, 2, 3.11, 13.83, 55.53, 66.2, 24.34, 68.4, 67.64, 6, 1, "Charoen Pokphand Indon", "CP", 9, 1], ["PGUN", "Pradiksi Gunatama", 3208.9, 2, 3.12, 0.07, 38.44, 92.38, 0, 99.9, 99.93, 29, 0, "Pt Araya Agro Lestari", "CP", 6, 0], ["MASB", "Bank Multiarta Sentosa", 3205.7, 2, 3.12, 5.1, 52.67, 75.99, 5.74, 90.4, 90.39, 7, 0, "Danabina Sentana", "CP", 10, 1], ["CSMI", "Cipta Selera Murni", 3205.1, 2, 3.12, 27.45, 56.15, 64.4, 0, 66.2, 59.91, 16, 1, "Lisa Muchtar", "ID", 7, 0], ["BRNA", "Berlina", 3189.3, 2, 3.14, 4.31, 54.57, 70.11, 12.75, 88.2, 82.94, 15, 0, "Pt Dwi Satrya Utama", "CP", 13, 2], ["FUJI", "Fuji Finance Indonesia", 3186.5, 2, 3.14, 9.21, 55.0, 67.37, 58.73, 32.1, 32.06, 4, 1, "Bank Julius Baer And C", "IB", 11, 1], ["BAUT", "Mitra Angkasa Sejahtera", 3178.3, 2, 3.15, 29.2, 54.16, 70.8, 54.16, 70.8, 70.8, 2, 1, "Na Fasteners Pte Ltd", "CP", 3, 1], ["OMRE", "Indonesia Prima Property", 3174.9, 2, 3.15, 3.9, 43.99, 82.54, 43.99, 96.1, 96.1, 13, 0, "First Pacific Capital ", "CP", 8, 1], ["NAIK", "Adiwarna Anugerah Abadi", 3173.7, 2, 3.15, 25.47, 54.53, 74.53, 0, 74.5, 74.53, 18, 1, "Pt Adiwarna Anugerah I", "CP", 3, 0], ["JSPT", "Jakarta Setiabudi Interna", 3172.9, 2, 3.15, 1.27, 50.95, 81.51, 33.41, 89.5, 89.52, 15, 0, "Pt Jan Darmadi Investi", "CP", 7, 4], ["KBAG", "Karya Bersama Anugerah", 3159.3, 2, 3.17, 30.87, 55.47, 66.79, 0, 69.1, 69.13, 18, 1, "Pt Visi Kota Indonesia", "CP", 5, 0], ["BACA", "Bank Capital Indonesia", 3157.7, 2, 3.17, 17.15, 50.66, 76.67, 25.14, 55.1, 52.43, 2, 1, "Pt. Capital Global Inv", "CP", 7, 1], ["FAST", "Fast Food Indonesia", 3139.2, 2, 3.19, 8.84, 41.18, 82.87, 5.93, 86.4, 81.63, 5, 1, "Pt Gelael Pratama", "CP", 7, 3], ["GDST", "Gunawan Dianjaya Steel", 3137.0, 2, 3.19, 3.12, 39.13, 83.23, 7.98, 87.0, 86.95, 13, 0, "Gwie Gunato Gunawan", "ID", 7, 1], ["JPFA", "Japfa Comfeed Indonesia", 3132.9, 2, 3.19, 25.24, 55.43, 63.21, 72.52, 66.2, 66.18, 2, 1, "Japfa Ltd", "CP", 8, 2], ["MEDC", "Medco Energi Internasiona", 3128.6, 2, 3.2, 20.83, 51.5, 76.35, 24.85, 78.7, 78.16, 3, 1, "Pt. Medco Daya Abadi L", "CP", 5, 2], ["VERN", "Verona Indah Pictures", 3124.7, 2, 3.2, 3.63, 46.63, 80.86, 0, 96.4, 96.37, 29, 0, "Pie Titin Suryani", "ID", 8, 0], ["TOSK", "Topindo Solusi Komunika", 3124.6, 2, 3.2, 25.21, 54.17, 72.8, 0, 74.8, 74.79, 16, 1, "Seiko Manito", "ID", 4, 0], ["MSJA", "Multi Spunindo Jaya", 3120.4, 2, 3.2, 4.41, 53.21, 70.2, 0, 81.6, 81.61, 31, 0, "Maju Selaras Jayamerta", "CP", 9, 0], ["AEGS", "Anugerah Spareparts Sejah", 3091.7, 2, 3.23, 30.18, 55.23, 62.13, 5.84, 64.0, 63.98, 0, 1, "J Suwanta Sinarya Dr", "ID", 7, 1], ["ERAA", "Erajaya Swasembada", 3083.7, 2, 3.24, 27.72, 55.17, 61.07, 9.61, 63.8, 59.95, 2, 1, "Eralink International ", "CP", 9, 4], ["DFAM", "Dafam Property Indonesia", 3070.4, 2, 3.26, 12.29, 53.43, 70.23, 0, 81.4, 75.08, 23, 0, "Pt. Dafam", "CP", 10, 0], ["TRUE", "Triniti Dinamik", 3068.6, 2, 3.26, 17.77, 52.83, 73.0, 0, 79.5, 79.51, 19, 0, "Pt Agung Perkasa Inves", "CP", 6, 0], ["FMII", "Fortune Mate Indonesia", 3062.2, 2, 3.27, 2.43, 46.67, 87.87, 7.53, 95.4, 95.4, 13, 0, "Pt Surya Mega Investin", "CP", 6, 2], ["CMRY", "Cisarua Mountain Dairy", 3058.3, 2, 3.27, 16.85, 53.56, 68.31, 7.05, 81.2, 80.72, 1, 1, "Bambang Sutantio", "ID", 7, 2], ["DGNS", "Diagnos Laboratorium Utam", 3056.0, 2, 3.27, 15.97, 39.2, 80.97, 0, 84.0, 84.03, 17, 1, "Pt Bundamedik", "CP", 5, 0], ["TBMS", "Tembaga Mulia Semanan", 3050.2, 2, 3.28, 8.34, 42.42, 86.23, 52.42, 57.3, 56.72, 4, 1, "The Furukawa Electric ", "CP", 7, 2], ["IMAS", "Indomobil Sukses Internas", 3048.3, 2, 3.28, 6.35, 49.49, 82.88, 50.66, 77.1, 75.81, 5, 1, "Gallant Venture Ltd", "CP", 7, 2], ["PADA", "Personel Alih Daya", 3045.3, 2, 3.28, 27.11, 53.57, 71.43, 0, 66.6, 66.6, 18, 1, "Pt Sinergi Inti Andala", "CP", 4, 0], ["MOLI", "Madusari Murni Indah", 3038.7, 2, 3.29, 8.2, 52.15, 71.81, 1.07, 90.7, 90.73, 7, 0, "Pt Cropsco Panen Indon", "CP", 8, 1], ["BABP", "Bank Mnc Internasional", 3034.5, 2, 3.3, 13.66, 48.85, 79.52, 23.44, 86.3, 86.34, 5, 1, "Pt Mnc Kapital Indones", "CP", 4, 1], ["HEXA", "Hexindo Adiperkasa", 3024.0, 2, 3.31, 16.89, 48.59, 78.71, 83.11, 79.9, 78.71, 1, 1, "Hitachi Construction M", "CP", 5, 4], ["BBCA", "Bank Central Asia", 3021.9, 2, 3.31, 41.82, 54.94, 57.16, 0, 58.2, 58.18, 18, 1, "Pt Dwimuria Investama ", "CP", 4, 0], ["AGAR", "Asia Sejahtera Mina", 3019.0, 2, 3.31, 1.26, 45.0, 79.29, 0, 98.7, 98.74, 29, 0, "Pt. Indo Kreasi Pratam", "CP", 8, 0], ["PART", "Cipta Perdana Lancar", 3013.8, 2, 3.32, 15.81, 53.22, 70.64, 0, 84.2, 84.19, 19, 0, "Cipta Investama Lancar", "CP", 11, 0], ["WEHA", "Weha Transportasi Indones", 3008.4, 2, 3.32, 15.5, 52.48, 71.02, 0, 84.5, 84.5, 19, 0, "Pt Panorama Sentrawisa", "CP", 10, 0], ["SRAJ", "Sejahteraraya Anugrahjaya", 3005.7, 2, 3.33, 1.64, 50.27, 76.63, 43.47, 75.7, 75.65, 15, 0, "Pt Surya Cipta Inti Ce", "CP", 10, 3], ["CINT", "Chitose Internasional", 3000.2, 2, 3.33, 6.82, 53.26, 64.28, 21.05, 70.9, 70.9, 6, 1, "Pt.Tritirta Inti Mandi", "CP", 13, 2], ["WIFI", "Solusi Sinergi Digital", 2991.7, 2, 3.34, 38.77, 54.42, 61.23, 1.54, 59.7, 59.69, 2, 1, "Pt. Investasi Sukses B", "CP", 3, 1], ["PNLF", "Panin Financial", 2991.6, 2, 3.34, 26.85, 52.47, 69.4, 1.48, 69.9, 69.93, 2, 1, "Pt Paninvest Tbk", "CP", 6, 1], ["HOMI", "Grand House Mulia", 2989.4, 2, 3.35, 3.97, 52.0, 72.0, 0, 96.0, 96.03, 31, 0, "Pt. Graha Mulia Indota", "CP", 11, 0], ["MITI", "Mitra Investindo", 2983.0, 2, 3.35, 14.59, 45.15, 80.75, 0, 85.4, 85.41, 21, 0, "Pt. Prime Asia Capital", "CP", 6, 0], ["CSRA", "Cisadane Sawit Raya", 2956.5, 2, 3.38, 6.71, 38.0, 80.88, 6.71, 86.6, 86.58, 5, 1, "Pt. Verdan Sawit Lesta", "CP", 7, 1], ["DGIK", "Nusa Konstruksi Enjinirin", 2953.8, 2, 3.39, 10.38, 52.3, 69.21, 12.39, 77.2, 77.23, 7, 0, "Pt Global Dinamika Ken", "CP", 10, 1], ["SMRU", "Smr Utama", 2951.8, 2, 3.39, 12.01, 52.3, 71.37, 1.94, 71.1, 54.24, 6, 1, "Trada Alam Minera Tbk", "CP", 12, 1], ["INTP", "Indocement Tunggal Prakar", 2949.3, 2, 3.39, 19.58, 53.4, 63.73, 69.92, 74.9, 72.04, 2, 1, "Heidelberg Materials A", "CP", 11, 5], ["HOTL", "Saraswati Griya Lestari", 2949.1, 2, 3.39, 4.79, 51.32, 71.94, 0, 94.5, 93.8, 31, 0, "Pt Tiara Realty", "CP", 11, 0], ["LPLI", "Star Pacific", 2942.4, 2, 3.4, 15.8, 50.6, 73.14, 18.3, 84.2, 84.2, 3, 1, "Bank Julius Baer Co. L", "CP", 8, 1], ["SQMI", "Wilton Makmur Indonesia", 2927.9, 2, 3.42, 13.96, 48.9, 75.98, 76.54, 57.8, 57.24, 4, 1, "Wilton Resources Holdi", "CP", 9, 1], ["KICI", "Kedaung Indah Can", 2916.0, 2, 3.43, 17.0, 43.62, 79.62, 1.21, 47.0, 47.0, 0, 2, "Pt Kedawung Subur", "CP", 5, 1], ["CANI", "Capitol Nusantara Indones", 2912.3, 2, 3.43, 6.14, 39.0, 83.1, 10.19, 49.8, 49.76, 4, 1, "Pt. Anugrah Semesta La", "CP", 8, 2], ["CASA", "Capital Financial Indones", 2909.0, 2, 3.44, 10.07, 52.67, 62.47, 22.88, 79.9, 79.87, 7, 0, "Pt Capital Strategic I", "CP", 13, 4], ["PGLI", "Pembangunan Graha Lestari", 2893.1, 2, 3.46, 10.33, 46.82, 76.8, 0, 89.7, 89.67, 21, 0, "Pt Alami Lestari Inves", "CP", 9, 0], ["KBLM", "Kabelindo Murni", 2892.0, 2, 3.46, 5.47, 40.27, 81.61, 0, 81.9, 81.93, 21, 0, "Pt. Sibalec", "CP", 13, 0], ["SMIL", "Sarana Mitra Luas", 2891.1, 2, 3.46, 8.48, 46.99, 78.99, 0, 53.4, 52.47, 20, 1, "Hadi Suhermin", "ID", 8, 0], ["GTBO", "Garda Tujuh Buana", 2890.7, 2, 3.46, 3.84, 33.39, 92.38, 69.95, 59.6, 59.6, 12, 0, "Green River Pte Ltd", "CP", 4, 2], ["CTRA", "Ciputra Development", 2886.0, 2, 3.47, 32.0, 53.31, 61.27, 7.34, 62.9, 60.28, 2, 1, "Pt. Sang Pelopor", "CP", 7, 3], ["BLES", "Superior Prima Sukses", 2882.1, 2, 3.47, 7.71, 40.83, 88.58, 0, 92.3, 92.29, 21, 0, "Global Base Universal", "CP", 5, 0], ["SAPX", "Satria Antaran Prima", 2875.8, 2, 3.48, 5.51, 46.56, 81.06, 47.93, 91.1, 91.06, 5, 0, "Pt Satria Investama Pe", "CP", 5, 1], ["WINE", "Hatten Bali", 2875.7, 2, 3.48, 12.01, 37.5, 82.24, 8.73, 79.3, 79.26, 5, 1, "Ida Bagus Rai Budarsa", "ID", 6, 1], ["KJEN", "Krida Jaringan Nusantara", 2860.2, 2, 3.5, 25.03, 52.5, 62.97, 0, 19.5, 16.55, 16, 1, "Grafi1Ndo Karya Nusant", "OT", 6, 0], ["GRIA", "Ingria Pratama Capitalind", 2853.6, 2, 3.5, 9.52, 47.27, 75.15, 0, 90.5, 90.48, 21, 0, "Khufran Hakim Noor", "ID", 11, 0], ["SCNP", "Selaras Citra Nusantara P", 2847.7, 2, 3.51, 2.52, 45.0, 79.36, 4.76, 95.1, 92.72, 13, 0, "Sena Dwimakmur", "CP", 11, 1], ["NFCX", "Nfc Indonesia", 2843.3, 2, 3.52, 14.24, 51.29, 69.18, 6.04, 79.7, 79.72, 7, 0, "Pt. Kresna Asset Manag", "CP", 12, 1], ["PSSI", "Imc Pelita Logistik", 2843.0, 2, 3.52, 2.65, 43.83, 78.09, 41.92, 97.3, 97.35, 13, 0, "Pt Indoprima Marine", "CP", 7, 1], ["BDKR", "Berdikari Pondasi Perkasa", 2842.7, 2, 3.52, 3.98, 51.01, 65.64, 2.24, 96.0, 96.02, 13, 0, "Tan John Tanuwijaya", "ID", 12, 1], ["TGKA", "Tigaraksa Satria", 2838.0, 2, 3.52, 3.19, 36.21, 90.9, 0, 96.8, 96.81, 29, 0, "Penta Widjaja Investin", "CP", 5, 0], ["CARE", "Metro Healthcare Indonesi", 2837.0, 2, 3.52, 14.27, 49.92, 71.65, 23.27, 61.1, 58.72, 4, 1, "Pt Metro Healthcare In", "CP", 10, 2], ["TPMA", "Trans Power Marine", 2836.5, 2, 3.53, 23.41, 52.04, 65.21, 0, 76.6, 76.59, 19, 0, "Pt Dwitunggal Perkasa ", "CP", 8, 0], ["OBMD", "Obm Drilchem", 2836.4, 2, 3.53, 21.29, 51.07, 71.13, 0, 78.7, 78.71, 19, 0, "Pt Indotek Driling Sol", "CP", 6, 0], ["BWPT", "Eagle High Plantations", 2814.7, 2, 3.55, 15.93, 37.7, 78.16, 40.46, 61.1, 41.53, 0, 2, "Cs Ag Sg Br S/A Pt Raj", "CP", 6, 2], ["MAGP", "Multi Agro Gemilang Plant", 2813.7, 2, 3.55, 18.13, 50.0, 72.46, 0, 78.5, 75.2, 17, 1, "Pt. Santika Griya Pers", "CP", 8, 0], ["DYAN", "Dyandra Media Internation", 2803.0, 2, 3.57, 15.33, 51.47, 63.7, 0, 77.1, 76.49, 19, 0, "Pt Teletransmedia", "CP", 10, 0], ["VICO", "Victoria Investama", 2802.0, 2, 3.57, 9.06, 45.06, 76.42, 1.73, 88.6, 88.61, 5, 1, "Pt Gratamulia Pratama", "CP", 9, 1], ["DPNS", "Duta Pertiwi Nusantara", 2775.5, 2, 3.6, 12.9, 51.18, 63.7, 11.49, 80.3, 80.29, 7, 0, "Dutapermana MakmurPt", "CP", 12, 1], ["ASPI", "Andalan Sakti Primaindo", 2773.5, 2, 3.61, 8.99, 51.18, 61.01, 0, 91.0, 91.01, 23, 0, "Andalan Sakti Inti", "CP", 13, 0], ["GULA", "Aman Agrindo", 2771.5, 2, 3.61, 17.73, 51.65, 62.01, 0, 79.6, 76.89, 19, 0, "Pt. Aman Resources Ind", "CP", 12, 0], ["SGER", "Sumber Global Energy", 2766.7, 2, 3.61, 12.87, 50.08, 69.55, 0, 83.3, 83.28, 23, 0, "Pt Sumbermas Inti Ener", "CP", 8, 0], ["RBMS", "Ristia Bintang Mahkotasej", 2765.7, 2, 3.62, 29.87, 51.88, 61.6, 0, 65.4, 60.65, 16, 1, "Richard R Wiriahardja", "ID", 7, 0], ["CFIN", "Clipan Finance Indonesia", 2762.0, 2, 3.62, 22.05, 51.49, 63.71, 13.66, 14.6, 9.69, 0, 2, "Bank Pan Indonesia Tbk", "IB", 11, 2], ["HYGN", "Ecocare Indo Pasifik", 2756.4, 2, 3.63, 7.98, 47.52, 75.4, 5.57, 87.3, 86.0, 5, 1, "Hendrik Yong", "ID", 11, 3], ["NTBK", "Nusatama Berkah", 2751.4, 2, 3.63, 29.04, 51.85, 60.55, 0, 71.0, 70.96, 18, 1, "Pt. Reborn Capital", "CP", 8, 0], ["SRTG", "Saratoga Investama Sedaya", 2749.9, 2, 3.64, 10.99, 35.88, 89.01, 0, 89.0, 89.01, 21, 0, "Edwin Soeryadjaya", "ID", 3, 0], ["PSDN", "Prasidha Aneka Niaga", 2746.9, 2, 3.64, 8.53, 47.0, 75.4, 0, 91.5, 91.47, 21, 0, "Pt Prasidha", "CP", 7, 0], ["ASPR", "Asia Pramulia", 2745.9, 2, 3.64, 11.4, 47.64, 72.47, 11.02, 88.6, 88.6, 5, 1, "Alex  Yoe", "ID", 10, 1], ["PTDU", "Djasa Ubersakti", 2743.4, 2, 3.65, 23.22, 41.67, 74.61, 0, 76.8, 76.78, 17, 1, "Pt Teknindo Geosistem ", "CP", 5, 0], ["CLPI", "Colorpak Indonesia", 2742.2, 2, 3.65, 17.25, 51.0, 65.08, 51.0, 82.8, 82.75, 3, 1, "Pt. Ink Color Int Pte.", "CP", 12, 1], ["IMPC", "Impack Pratama Industri", 2741.0, 2, 3.65, 17.27, 37.81, 78.06, 4.51, 74.7, 74.69, 0, 1, "Tunggal Jaya Investama", "CP", 5, 1], ["HDIT", "Hensel Davest Indonesia", 2740.9, 2, 3.65, 40.62, 52.25, 55.91, 0, 59.4, 59.38, 18, 1, "Pt Davest Investama Ma", "CP", 6, 0], ["NICL", "Pam Mineral", 2739.5, 2, 3.65, 13.38, 43.23, 75.56, 0, 57.8, 57.8, 20, 1, "Pam Metalindo Pt", "CP", 8, 0], ["MSIN", "Mnc Digital Entertainment", 2736.9, 2, 3.65, 13.33, 50.02, 67.11, 5.24, 25.8, 25.8, 4, 1, "Pt.Media Nusantara Cit", "OT", 11, 2], ["IOTF", "Sumber Sinergi Makmur", 2726.1, 2, 3.67, 30.17, 48.3, 69.83, 0, 69.8, 69.83, 16, 1, "Alamsyah", "ID", 3, 0], ["IDEA", "Idea Indonesia Akademi", 2723.3, 2, 3.67, 20.27, 37.91, 76.49, 5.16, 76.8, 76.81, 1, 1, "Eko Desriyanto", "ID", 5, 2], ["BMRI", "Bank Mandiri ( Persero )", 2717.5, 2, 3.68, 37.93, 51.48, 60.81, 1.26, 52.8, 51.48, 2, 1, "Perusahaan Perseroan (", "CP", 4, 1], ["TAMA", "Lancartama Sejati", 2702.7, 2, 3.7, 24.62, 50.33, 66.48, 0, 75.4, 75.38, 19, 0, "Lancartama Tirta Angga", "CP", 9, 0], ["COCO", "Wahana Interfood Nusantar", 2698.5, 2, 3.71, 27.09, 51.32, 59.87, 57.91, 65.4, 65.42, 2, 1, "Mahogany Global Invest", "CP", 10, 3], ["BANK", "Bank Aladin Syariah", 2695.6, 2, 3.71, 16.09, 50.82, 60.11, 12.18, 67.7, 61.86, 2, 1, "Pt Aladin Global Ventu", "CP", 13, 3], ["TLKM", "Telkom Indonesia (Persero", 2681.4, 2, 3.73, 38.31, 51.57, 56.52, 7.72, 53.7, 51.57, 2, 1, "Perusahaan Perseroan (", "CP", 6, 3], ["BFIN", "Bfi Finance Indonesia", 2679.4, 2, 3.73, 26.04, 51.12, 60.03, 65.12, 15.7, 12.67, 0, 2, "Trinugraha Capital And", "OT", 11, 3], ["PTRO", "Petrosea", 2678.2, 2, 3.73, 20.43, 45.33, 72.82, 5.86, 76.5, 76.53, 1, 1, "Pt. Kreasi Jasa Persad", "CP", 6, 2], ["BTON", "Betonjaya Manunggal", 2677.1, 2, 3.74, 2.31, 35.94, 77.02, 1.67, 96.0, 96.02, 13, 0, "Gwie Gunadi Gunawan", "ID", 11, 1], ["LAPD", "Leyand International", 2666.7, 2, 3.75, 29.53, 51.0, 60.23, 7.38, 70.5, 70.47, 2, 1, "Pt Jsi Sinergi Mas", "CP", 8, 1], ["ELSA", "Elnusa", 2663.9, 2, 3.75, 33.03, 51.1, 59.16, 3.45, 62.1, 60.95, 2, 1, "Pt Pertamina Hulu Ener", "CP", 9, 2], ["MBMA", "Merdeka Battery Materials", 2657.6, 2, 3.76, 11.59, 50.04, 63.05, 14.81, 87.3, 87.35, 7, 0, "Merdeka Energi Nusanta", "CP", 14, 3], ["BJTM", "Bank Pembangunan Daerah J", 2649.0, 2, 3.78, 31.66, 51.13, 56.36, 0, 1.4, 0, 16, 1, "Pemda Tingkat I Provin", "OT", 10, 0], ["SMSM", "Selamat Sempurna", 2636.5, 2, 3.79, 16.82, 50.54, 57.18, 15.1, 77.1, 71.03, 2, 1, "Pt Adrindo Inti Perkas", "CP", 15, 3], ["MAPI", "Mitra Adiperkasa", 2636.2, 2, 3.79, 33.58, 51.0, 57.15, 9.88, 57.4, 51.0, 2, 1, "Pt Satya Mulia Gema Ge", "CP", 9, 6], ["JAYA", "Armada Berjaya Trans", 2631.3, 2, 3.8, 18.26, 45.79, 74.31, 0, 81.7, 81.74, 17, 1, "Prima Globalindo Logis", "CP", 5, 0], ["DNET", "Indoritel Makmur Internas", 2627.7, 2, 3.81, 2.15, 39.35, 84.78, 45.4, 96.6, 95.29, 13, 0, "Hannawell Group Limite", "CP", 9, 1], ["PTPP", "Pp (Persero)", 2626.4, 2, 3.81, 37.64, 51.0, 56.87, 0, 55.4, 52.52, 18, 1, "Perusahaan Perseroan (", "CP", 7, 0], ["YOII", "Asuransi Digital Bersama", 2624.5, 2, 3.81, 10.03, 42.3, 76.77, 4.97, 84.3, 78.68, 5, 1, "Adi Wibowo Adisaputro", "ID", 9, 1], ["LAND", "Trimitra Propertindo", 2621.4, 2, 3.81, 23.56, 36.88, 74.1, 0, 76.4, 76.44, 17, 1, "Pt. Graha Mulia Indota", "CP", 5, 0], ["DWGL", "Dwi Guna Laksana", 2620.1, 2, 3.82, 2.31, 48.52, 66.52, 0, 41.2, 36.06, 28, 0, "Hawthorn-Capital Inves", "OT", 14, 0], ["KDTN", "Puri Sentul Permai", 2612.6, 2, 3.83, 9.21, 38.12, 86.12, 0, 90.8, 90.79, 21, 0, "Putrasakti Mandiri Pt", "CP", 6, 0], ["AGII", "Samator Indo Gas", 2611.4, 2, 3.83, 4.59, 35.24, 82.42, 35.17, 95.4, 95.41, 13, 0, "Pt Samator", "CP", 5, 2], ["AMRT", "Sumber Alfaria Trijaya", 2608.5, 2, 3.83, 25.4, 50.19, 59.9, 15.54, 71.3, 68.1, 2, 1, "Pt Sigmantara Alfindo", "CP", 9, 4], ["MPPA", "Matahari Putra Prima", 2601.2, 2, 3.84, 36.85, 50.14, 61.21, 13.01, 54.3, 54.29, 2, 1, "Pt. Multipolar Tbk", "CP", 4, 2], ["LMPI", "Langgeng Makmur Industri", 2598.7, 2, 3.85, 3.06, 38.24, 81.4, 0, 91.2, 91.2, 29, 0, "Hidayat Alim", "ID", 8, 0], ["SMGR", "Semen Indonesia (Persero)", 2596.9, 2, 3.85, 36.75, 50.69, 56.83, 7.95, 55.5, 50.69, 2, 1, "Perusahaan Perseroan (", "CP", 8, 3], ["MICE", "Multi Indocitra", 2595.7, 2, 3.85, 8.77, 48.34, 66.44, 22.71, 72.3, 70.35, 4, 1, "Pt. Buana Graha Utama", "CP", 11, 4], ["GJTL", "Gajah Tunggal", 2595.2, 2, 3.85, 29.66, 49.5, 65.52, 63.3, 59.6, 58.93, 0, 2, "Denham Pte Ltd", "CP", 6, 4], ["PUDP", "Pudjiadi Prestige", 2579.2, 2, 3.88, 8.7, 44.54, 71.42, 0, 91.3, 91.3, 21, 0, "Pt. Istana Kuta Ratu P", "CP", 11, 0], ["HBAT", "Minahasa Membangun Hebat", 2578.4, 2, 3.88, 21.03, 44.94, 76.87, 0, 79.0, 78.97, 17, 1, "Hendra Sutanto", "ID", 4, 0], ["JTPE", "Jasuindo Tiga Perkasa", 2578.3, 2, 3.88, 6.65, 45.67, 70.66, 24.99, 93.4, 93.35, 5, 0, "Pt. Jasuindo Multi Inv", "CP", 13, 2], ["KBLI", "Kmi Wire And Cable", 2576.2, 2, 3.88, 15.32, 49.47, 58.69, 5.7, 65.0, 51.09, 0, 2, "Pt.Omedata Electronics", "CP", 12, 2], ["ANDI", "Andira Agro", 2572.1, 2, 3.89, 23.27, 49.73, 60.77, 0, 70.0, 65.48, 16, 1, "Central Energi Pratama", "CP", 12, 0], ["AREA", "Dunia Virtual Online", 2569.7, 2, 3.89, 5.51, 38.06, 79.85, 0, 94.5, 94.49, 21, 0, "Pt. Dwi Tunggal Putra", "CP", 7, 0], ["DRMA", "Dharma Polimetal", 2561.7, 2, 3.9, 11.85, 47.6, 66.86, 8.56, 82.6, 79.59, 5, 1, "Dharma Inti Anugerah ", "CP", 11, 3], ["IATA", "Mnc Energy Investments", 2557.0, 2, 3.91, 26.8, 48.79, 65.25, 0, 73.2, 73.2, 16, 1, "Pt. Karya Pacific Inve", "CP", 7, 0], ["INDF", "Indofood Sukses Makmur", 2551.0, 2, 3.92, 37.23, 50.07, 58.77, 59.03, 58.1, 55.03, 2, 1, "First Pacific Investme", "CP", 6, 5], ["ASII", "Astra International", 2545.3, 2, 3.93, 38.83, 50.11, 57.59, 57.42, 58.5, 55.86, 2, 1, "Jardine Cycle  And Car", "CP", 6, 4], ["ISAP", "Isra Presisi Indonesia", 2543.4, 2, 3.93, 46.7, 50.39, 53.3, 0, 53.3, 53.3, 18, 1, "Pt. Dua Putra Bersiner", "CP", 3, 0], ["GTRA", "Grahaprima Suksesmandiri", 2540.8, 2, 3.94, 5.5, 34.95, 74.95, 0, 94.5, 94.5, 21, 0, "Trimulti Adinata Perka", "CP", 9, 0], ["TOTO", "Surya Toto Indonesia", 2530.3, 2, 3.95, 8.83, 36.6, 84.8, 1.08, 5.3, 5.29, 4, 1, "Toto Limited", "OT", 5, 1], ["SOCI", "Soechi Lines", 2526.3, 2, 3.96, 14.13, 35.05, 75.02, 0, 85.9, 85.87, 21, 0, "Pt Pilar Sukses Utama", "CP", 6, 0], ["MKPI", "Metropolitan Kentjana", 2520.0, 2, 3.97, 6.22, 47.45, 63.2, 0, 91.2, 91.16, 21, 0, "Pt.Karuna Paramita Pro", "CP", 12, 0], ["PIPA", "Multi Makmur Lemindo", 2515.2, 2, 3.98, 39.86, 49.92, 55.43, 0, 60.1, 60.14, 16, 1, "Pt Morris Capital Indo", "CP", 6, 0], ["NASI", "Wahana Inti Makmur", 2513.9, 2, 3.98, 22.97, 42.24, 71.27, 1.51, 77.0, 77.03, 1, 1, "Piero Mustafa", "ID", 7, 1], ["KOKA", "Koka Indonesia", 2508.2, 2, 3.99, 17.63, 42.75, 73.1, 11.0, 82.4, 82.37, 1, 1, "Gao Jing", "ID", 6, 1], ["TOWR", "Sarana Menara Nusantara", 2495.6, 1, 4.01, 18.64, 45.29, 70.07, 6.33, 75.0, 73.2, 0, 1, "Pt Sapta Adhikari Inve", "CP", 9, 3], ["MLIA", "Mulia Industrindo", 2487.9, 1, 4.02, 6.52, 41.45, 72.11, 23.36, 88.8, 88.84, 5, 1, "Pt. Eka Gunatama Mandi", "CP", 10, 2], ["MARK", "Mark Dynamics Indonesia", 2486.9, 1, 4.02, 15.38, 42.39, 78.48, 47.16, 37.5, 37.46, 0, 2, "Tecable (Hk) Co. Limit", "OT", 5, 2], ["MTPS", "Meta Epsi", 2479.0, 1, 4.03, 20.19, 35.7, 74.95, 0, 74.9, 69.92, 16, 1, "Central Energi Pratama", "CP", 6, 0], ["BCAP", "Mnc Kapital Indonesia", 2477.2, 1, 4.04, 14.51, 47.25, 65.1, 29.28, 67.4, 67.38, 4, 1, "Pt. Mnc Asia Holding T", "CP", 10, 4], ["AVIA", "Avia Avian", 2468.6, 1, 4.05, 12.96, 36.6, 75.39, 8.51, 48.2, 48.2, 4, 1, "Pt Tancorp Surya Sento", "OT", 8, 2], ["ASBI", "Asuransi Bintang", 2463.3, 1, 4.06, 5.37, 35.46, 83.96, 0, 92.7, 90.79, 21, 0, "Pt Srihana Utama", "CP", 8, 0], ["DAAZ", "Daaz Bara Lestari", 2460.2, 1, 4.06, 4.25, 42.49, 72.24, 7.86, 92.6, 92.64, 13, 0, "Pt Daaz Nusantara Abad", "CP", 7, 1], ["TYRE", "King Tire Indonesia", 2448.6, 1, 4.08, 4.01, 34.06, 81.59, 0, 96.0, 95.99, 29, 0, "Harris Muliawan", "ID", 9, 0], ["SMMA", "Sinar Mas Multiartha", 2448.5, 1, 4.08, 30.49, 48.93, 56.95, 11.02, 60.9, 60.37, 0, 1, "Sinar Mas Cakrawala", "CP", 11, 2], ["WAPO", "Wahana Pronatural", 2448.0, 1, 4.08, 12.09, 36.07, 76.57, 0, 85.9, 85.92, 21, 0, "Hijau Sari Pt.", "CP", 9, 0], ["INCO", "Vale Indonesia", 2444.8, 1, 4.09, 15.54, 34.0, 79.36, 48.21, 81.3, 79.36, 1, 1, "Perusahaan Perseroan (", "CP", 6, 4], ["BEST", "Bekasi Fajar Industrial E", 2436.5, 1, 4.1, 29.7, 48.13, 60.38, 10.0, 67.1, 65.27, 0, 1, "Pt Argo Manunggal Land", "CP", 10, 1], ["UANG", "Pakuan", 2435.8, 1, 4.11, 6.77, 41.0, 76.59, 0, 92.1, 92.12, 21, 0, "Sirius Surya Sentosa ", "CP", 7, 0], ["TRIO", "Trikomsel Oke", 2432.6, 1, 4.11, 1.99, 38.25, 76.75, 48.13, 57.8, 57.77, 12, 0, "Sukses Perdana Prima ", "CP", 8, 1], ["REAL", "Repower Asia Indonesia", 2425.2, 1, 4.12, 37.71, 46.72, 62.29, 0, 62.3, 62.29, 16, 1, "Enam Berlian Sinergi", "CP", 2, 0], ["BNBA", "Bank Bumi Arta", 2424.8, 1, 4.12, 8.35, 33.45, 80.7, 0, 44.4, 44.4, 20, 1, "Pt Takjub Finansial Te", "CP", 4, 0], ["GPSO", "Geoprima Solusi", 2418.3, 1, 4.14, 39.46, 48.95, 54.04, 1.12, 59.4, 59.42, 0, 2, "Pt Pimsf Pulogadung", "CP", 8, 1], ["MSTI", "Mastersystem Infotama", 2416.0, 1, 4.14, 9.5, 28.75, 84.98, 4.36, 86.2, 84.98, 5, 1, "Jupri Wijaya", "ID", 7, 3], ["BATR", "Benteng Api Technic", 2415.9, 1, 4.14, 4.58, 44.05, 72.27, 0, 95.4, 95.42, 29, 0, "Ridwan", "ID", 11, 0], ["SOHO", "Soho Global Health", 2414.1, 1, 4.14, 0.33, 40.03, 72.5, 90.66, 59.6, 59.64, 12, 0, "Uob Kay Hian Private L", "SC", 7, 4], ["TPIA", "Chandra Asri Pacific", 2411.1, 1, 4.15, 6.18, 34.63, 80.2, 8.59, 61.6, 61.55, 4, 1, "Barito Pacific Tbk", "CP", 7, 2], ["MYOR", "Mayora Indah", 2409.2, 1, 4.15, 11.69, 32.93, 84.29, 2.79, 1.2, 0, 4, 1, "Unita Branindo", "OT", 6, 2], ["FOLK", "Multi Garam Utama", 2408.9, 1, 4.15, 14.01, 42.98, 70.2, 0, 86.0, 85.99, 21, 0, "Pt Garam Ventura Indon", "CP", 10, 0], ["BKDP", "Bukit Darmo Property", 2405.0, 1, 4.16, 5.67, 34.6, 75.66, 0, 59.7, 59.73, 20, 1, "Adhibalaraja Pt.", "OT", 9, 0], ["ATIC", "Anabatic Technologies", 2376.9, 1, 4.21, 4.73, 37.3, 76.3, 47.61, 95.3, 95.27, 13, 0, "Tis Inc", "CP", 11, 2], ["ATLA", "Atlantis Subsea Indonesia", 2376.9, 1, 4.21, 37.35, 45.72, 62.65, 0, 62.6, 62.65, 16, 1, "Rudi R. Sutantra", "ID", 2, 0], ["ADRO", "Alamtri Resources Indones", 2376.6, 1, 4.21, 29.42, 47.79, 58.52, 1.63, 70.6, 70.58, 0, 1, "Adaro Strategic Invest", "CP", 8, 1], ["OILS", "Indo Oil Perkasa", 2373.6, 1, 4.21, 33.74, 47.85, 58.76, 0, 66.3, 66.26, 16, 1, "Mandalindo Putra Perka", "CP", 7, 0], ["GPRA", "Perdana Gapuraprima", 2368.9, 1, 4.22, 18.15, 47.5, 57.13, 0, 79.8, 79.84, 17, 1, "Pt Abadimukti Gunalest", "CP", 13, 0], ["POWR", "Cikarang Listrindo", 2362.4, 1, 4.23, 9.08, 30.48, 83.76, 2.28, 89.8, 88.64, 5, 1, "Pt. Udinda Wahanatama", "CP", 7, 1], ["MORA", "Mora Telematika Indonesia", 2354.0, 1, 4.25, 0.27, 35.99, 71.14, 33.56, 68.5, 68.49, 12, 0, "Pt Candrakarya Multikr", "CP", 10, 3], ["HILL", "Hillcon", 2351.7, 1, 4.25, 12.62, 41.41, 75.98, 1.47, 47.6, 47.64, 4, 1, "Pt Hillcon Equity Mana", "CP", 8, 1], ["INPP", "Indonesian Paradise Prope", 2348.4, 1, 4.26, 3.54, 36.14, 74.29, 48.68, 82.3, 82.29, 13, 0, "Grahatama Kreasibaru", "CP", 7, 2], ["RDTX", "Roda Vivatex", 2345.7, 1, 4.26, 1.95, 42.51, 69.71, 0, 98.0, 98.05, 29, 0, "Sutiadi Widjaja", "ID", 12, 0], ["CNTX", "Centex Seri A Preferen", 2344.2, 1, 4.27, 7.29, 34.2, 79.69, 16.49, 58.0, 58.0, 4, 1, "Pt Prospect Motor", "CP", 6, 1], ["NANO", "Nanotech Indonesia Global", 2328.2, 1, 4.3, 31.29, 47.5, 56.92, 3.5, 68.7, 68.71, 0, 1, "Nanotech Investama Sed", "CP", 9, 1], ["LFLO", "Imago Mulia Persada", 2325.9, 1, 4.3, 2.03, 32.57, 81.43, 0, 98.0, 97.97, 29, 0, "Ang Phek Tuan", "ID", 7, 0], ["PSKT", "Red Planet Indonesia", 2323.0, 1, 4.3, 14.82, 40.77, 72.83, 0, 85.2, 85.18, 21, 0, "Pt Basis Utama Prima", "CP", 7, 0], ["TRAM", "Trada Alam Minera", 2321.7, 1, 4.31, 23.62, 47.14, 57.21, 1.08, 21.7, 15.9, 0, 2, "Jaksa Agung Muda Bidan", "OT", 13, 1], ["FILM", "Md Entertainment", 2320.5, 1, 4.31, 10.48, 44.12, 67.3, 15.02, 33.0, 32.98, 4, 1, "Pt Md Corp Enterprises", "OT", 10, 3], ["PANR", "Panorama Sentrawisata", 2318.0, 1, 4.31, 4.27, 44.9, 60.53, 0, 95.7, 95.73, 29, 0, "Pt Panorama Tirta Anug", "CP", 11, 0], ["TOPS", "Totalindo Eka Persada", 2315.5, 1, 4.32, 33.17, 47.39, 56.9, 5.32, 65.2, 65.22, 0, 1, "Totalindo Investama Pe", "CP", 8, 2], ["STAA", "Sumber Tani Agung Resourc", 2313.2, 1, 4.32, 3.92, 36.69, 71.81, 4.75, 96.1, 96.08, 13, 0, "Pt Malibu Indah Lestar", "CP", 10, 1], ["CYBR", "Itsec Asia", 2303.2, 1, 4.34, 10.8, 39.06, 73.14, 85.49, 72.5, 72.48, 4, 1, "Inv Management Pte Ltd", "CP", 8, 6], ["BYAN", "Bayan Resources", 2301.2, 1, 4.35, 1.54, 40.22, 72.22, 42.0, 98.5, 98.46, 13, 0, "Low Tuck Kwong", "ID", 10, 2], ["BIKA", "Binakarya Jaya Abadi", 2297.5, 1, 4.35, 5.11, 33.92, 71.02, 0, 94.9, 94.89, 21, 0, "Liliana Setiawan", "ID", 10, 0], ["CSAP", "Catur Sentosa Adiprana", 2291.4, 1, 4.36, 7.69, 32.01, 76.08, 54.07, 75.7, 69.13, 4, 1, "Pt.Buanatata Adisentos", "CP", 5, 3], ["ALII", "Ancara Logistics Indonesi", 2283.1, 1, 4.38, 2.79, 32.87, 75.47, 60.16, 89.2, 81.11, 13, 0, "Pt. Graha Adika Niaga", "CP", 10, 3], ["IPOL", "Indopoly Swakarsa Industr", 2273.8, 1, 4.4, 8.28, 29.54, 81.39, 56.22, 88.2, 88.19, 5, 1, "Jefflyne Golden Holdin", "CP", 6, 2], ["NOBU", "Bank Nationalnobu", 2272.1, 1, 4.4, 7.48, 40.0, 70.6, 46.91, 65.6, 45.61, 4, 1, "Hanwha Life Insurance ", "IS", 7, 2], ["KKGI", "Resource Alam Indonesia", 2271.0, 1, 4.4, 12.08, 37.11, 73.21, 53.82, 86.0, 86.05, 5, 1, "Energy Collier Private", "CP", 8, 2], ["MPOW", "Megapower Makmur", 2270.1, 1, 4.41, 14.03, 44.8, 61.71, 60.6, 41.2, 41.17, 4, 1, "Phillip Securities Pte", "SC", 9, 3], ["ARKO", "Arkora Hydro", 2269.8, 1, 4.41, 17.45, 38.89, 70.38, 1.07, 82.5, 82.55, 1, 1, "Arkora Bakti Indonesia", "CP", 9, 1], ["TFAS", "Telefast Indonesia", 2269.1, 1, 4.41, 13.03, 41.95, 71.01, 7.47, 79.5, 79.5, 5, 1, "Pt. Kresna Asset Manag", "CP", 7, 1], ["PACK", "Abadi Nusantara Hijau Inv", 2262.7, 1, 4.42, 36.61, 46.37, 58.72, 9.91, 53.5, 53.48, 0, 2, "Pt Eco Energi Perkasa", "CP", 6, 1], ["PEGE", "Panca Global Kapital", 2261.1, 1, 4.42, 17.93, 42.29, 70.29, 42.29, 82.1, 82.07, 1, 1, "Rr Capital Group Pte. ", "CP", 9, 1], ["INDY", "Indika Energy", 2252.1, 1, 4.44, 22.87, 37.79, 70.96, 0, 76.3, 75.47, 17, 1, "Indika Inti Investindo", "CP", 7, 0], ["BUKA", "Bukalapak.Com", 2249.3, 1, 4.45, 26.34, 44.91, 65.86, 4.03, 72.5, 71.43, 0, 1, "Kreatif Media Karya Pt", "CP", 8, 2], ["OKAS", "Ancora Indonesia Resource", 2241.4, 1, 4.46, 18.9, 38.69, 72.51, 11.18, 52.5, 52.54, 0, 2, "Pt. Multi Berkat Energ", "CP", 7, 3], ["SKLT", "Sekar Laut", 2225.4, 1, 4.49, 2.06, 42.91, 63.03, 66.06, 35.8, 35.77, 12, 0, "Green Resources Invest", "OT", 11, 1], ["BVIC", "Bank Victoria Internation", 2215.0, 1, 4.51, 8.98, 40.07, 70.79, 19.92, 84.9, 84.88, 5, 1, "Pt. Victoria Investama", "CP", 8, 4], ["ROCK", "Rockfields Properti Indon", 2212.8, 1, 4.52, 0.2, 27.0, 80.0, 4.2, 95.6, 95.6, 13, 0, "Luciana", "ID", 8, 1], ["DMND", "Diamond Food Indonesia", 2195.2, 1, 4.56, 1.06, 34.93, 74.79, 26.93, 95.5, 92.0, 13, 0, "Chen Tsen Nan", "ID", 7, 1], ["PTPW", "Pratama Widya", 2177.4, 1, 4.59, 10.24, 36.2, 71.69, 0, 89.8, 89.76, 21, 0, "Andreas Widhatama Kurn", "ID", 6, 0], ["SCCO", "Supreme Cable Manufacturi", 2177.4, 1, 4.59, 13.43, 33.6, 75.08, 0, 64.2, 63.27, 20, 1, "Pt. Moda Sukses Makmur", "CP", 8, 0], ["ECII", "Electronic City Indonesia", 2173.3, 1, 4.6, 6.11, 29.78, 78.5, 29.78, 14.6, 13.82, 4, 1, "Uob Kay Hian Private L", "SC", 7, 1], ["HELI", "Jaya Trishindo", 2172.4, 1, 4.6, 9.68, 30.25, 77.78, 10.18, 80.1, 80.14, 5, 1, "Pt Startel Communicati", "CP", 6, 1], ["RAJA", "Rukun Raharja", 2155.1, 1, 4.64, 23.45, 35.25, 75.15, 0, 76.5, 76.55, 17, 1, "Pt Sentosa Bersama Mit", "CP", 4, 0], ["BUMI", "Bumi Resources", 2154.6, 1, 4.64, 37.66, 45.78, 54.86, 61.16, 54.1, 54.12, 0, 2, "Mach Energy (Hongkong)", "CP", 7, 4], ["CPRO", "Central Proteinaprima", 2153.4, 1, 4.64, 27.75, 45.15, 54.88, 25.78, 46.5, 46.47, 0, 2, "Pt Central Pangan Prim", "CP", 8, 2], ["ZONE", "Mega Perintis", 2152.2, 1, 4.65, 1.77, 35.92, 71.78, 4.82, 93.4, 93.41, 13, 0, "Verosito Gunawan", "ID", 8, 1], ["SLIS", "Gaya Abadi Sempurna", 2140.8, 1, 4.67, 45.75, 45.67, 54.25, 0, 54.2, 54.25, 16, 1, "Pt Selis Investama Ind", "CP", 3, 0], ["TRUK", "Guna Timur Raya", 2135.9, 1, 4.68, 12.13, 40.17, 65.17, 0, 87.9, 87.87, 21, 0, "Pt Guna Makmur Raya", "CP", 9, 0], ["FUTR", "Futura Energi Global", 2135.2, 1, 4.68, 26.93, 45.0, 55.09, 0, 73.1, 73.07, 16, 1, "Pt Aurora Dhana Nusant", "CP", 9, 0], ["DIGI", "Arkadia Digital Media", 2117.1, 1, 4.72, 29.02, 35.99, 69.42, 0, 71.0, 70.98, 16, 1, "Harvest Capital Intern", "CP", 4, 0], ["DEPO", "Caturkarda Depo Bangunan", 2106.0, 1, 4.75, 6.06, 23.5, 69.63, 24.31, 69.0, 69.0, 4, 1, "Pt Tancorp Surya Sukse", "CP", 5, 2], ["ARGO", "Argo Pantes", 2099.6, 1, 4.76, 8.11, 38.74, 68.13, 0, 18.3, 18.26, 20, 1, "Argo Manunggal Land De", "OT", 10, 0], ["ARKA", "Arkha Jayanti Persada", 2095.3, 1, 4.77, 42.42, 44.62, 56.18, 0, 57.6, 57.58, 16, 1, "Pt. Arkha Tanto Prima", "CP", 4, 0], ["CNKO", "Exploitasi Energi Indones", 2092.4, 1, 4.78, 46.97, 45.59, 49.54, 45.59, 53.0, 53.03, 0, 2, "Anderson Bay Pte Ltd", "CP", 5, 1], ["CCSI", "Communication Cable Syste", 2091.1, 1, 4.78, 8.33, 35.3, 72.0, 11.3, 91.7, 91.67, 5, 0, "Grahatama Kreasibaru", "CP", 6, 1], ["TRIN", "Perintis Triniti Properti", 2077.1, 1, 4.81, 20.52, 35.78, 68.88, 0, 78.4, 78.43, 17, 1, "Pt Kunci Daud Indonesi", "CP", 10, 0], ["TELE", "Omni Inovasi Indonesia", 2075.3, 1, 4.82, 19.96, 37.32, 69.63, 0, 80.0, 80.04, 17, 1, "Upaya Cipta Sejahtera ", "CP", 6, 0], ["MSIE", "Multisarana Intan Eduka", 2072.2, 1, 4.83, 13.35, 30.14, 75.35, 0, 86.7, 86.65, 21, 0, "Suzanna Rosa Prawiroma", "ID", 8, 0], ["PICO", "Pelangi Indah Canindo", 2068.0, 1, 4.84, 26.68, 32.04, 68.69, 0, 73.3, 73.32, 16, 1, "Pt Saranamulia Mahardh", "CP", 5, 0], ["BAPI", "Bhakti Agung Propertindo", 2066.5, 1, 4.84, 28.96, 40.25, 69.63, 0, 30.1, 29.38, 16, 1, "Pt Grha Agung Properti", "OT", 4, 0], ["MTSM", "Metro Realty Pt", 2060.8, 1, 4.85, 5.17, 34.53, 74.39, 20.67, 86.7, 86.67, 5, 1, "Yakin Wiskon", "CP", 11, 1], ["BUAH", "Segar Kumala Indonesia", 2050.0, 1, 4.88, 4.88, 36.5, 66.09, 0, 95.1, 95.12, 29, 0, "Hendro Susilo", "ID", 12, 0], ["ITMA", "Sumber Energi Andalan", 2044.6, 1, 4.89, 11.65, 41.9, 60.54, 1.46, 84.6, 84.56, 5, 1, "Pt Astrindo Nusantara ", "CP", 13, 1], ["EAST", "Eastparc Hotel", 2044.5, 1, 4.89, 10.94, 43.74, 53.53, 31.41, 89.1, 89.06, 5, 1, "Khalid Bin Omar Abdat", "ID", 20, 2], ["MDIY", "Daya Intiguna Yasa", 2043.1, 1, 4.89, 15.95, 35.49, 72.72, 81.98, 80.4, 80.44, 1, 1, "Mdih (Singapore) Pte. ", "CP", 6, 3], ["INKP", "Indah Kiat Pulp And Paper", 2042.2, 1, 4.9, 24.07, 41.05, 63.2, 10.18, 67.1, 67.11, 0, 1, "App Purinusa Ekapersad", "CP", 8, 3], ["ESIP", "Sinergi Inti Plastindo", 2038.4, 1, 4.91, 36.15, 31.93, 63.85, 0, 63.9, 63.85, 16, 1, "Pt Tanindo Omega Pasif", "CP", 2, 0], ["BUKK", "Bukaka Teknik Utama", 2036.9, 1, 4.91, 4.67, 29.91, 71.3, 0, 90.9, 90.9, 29, 0, "Solihin Jusuf Kalla", "ID", 8, 0], ["MAXI", "Maxindo Karya Anugerah", 2024.9, 1, 4.94, 12.69, 30.85, 70.64, 0, 87.3, 87.31, 21, 0, "Pt Bintang Mulia Gemil", "CP", 9, 0], ["IBOS", "Indo Boga Sukses", 2014.2, 1, 4.96, 22.77, 42.6, 59.13, 4.96, 55.7, 55.74, 0, 2, "Pt. Goldman Investindo", "CP", 11, 1], ["AADI", "Adaro Andalan Indonesia", 2011.2, 1, 4.97, 20.51, 41.1, 62.3, 1.29, 78.2, 78.2, 1, 1, "Adaro Strategic Invest", "CP", 10, 1], ["MTMH", "Murni Sadar", 2005.8, 1, 4.99, 5.19, 32.56, 74.26, 7.9, 58.3, 58.26, 4, 1, "Sumatera Teknindo", "OT", 9, 2], ["PDPP", "Primadaya Plastisindo", 2003.5, 1, 4.99, 2.86, 40.0, 59.0, 8.0, 97.1, 97.14, 13, 0, "Tirto Angesty", "ID", 11, 1], ["AIMS", "Artha Mahiya Investama", 1999.2, 1, 5.0, 21.23, 31.16, 67.36, 0, 78.8, 78.77, 17, 1, "Pt Aims Indo Investama", "CP", 8, 0], ["BUDI", "Budi Starch & Sweetener", 1996.9, 1, 5.01, 4.49, 33.06, 67.49, 35.75, 69.5, 69.54, 12, 0, "Pt Budi Delta Swakarya", "CP", 9, 1], ["INDX", "Tanah Laut", 1993.9, 1, 5.02, 37.29, 38.11, 62.71, 62.71, 0.0, 0, 0, 2, "Equatorex Sdn Bhd", "IB", 3, 2], ["OBAT", "Brigit Biofarmaka Teknolo", 1982.1, 1, 5.05, 18.95, 31.6, 72.59, 0, 81.0, 81.05, 17, 1, "Machmud Lutfi Huzain", "ID", 8, 0], ["HADE", "Himalaya Energi Perkasa", 1981.7, 1, 5.05, 35.3, 43.26, 54.87, 0, 57.4, 50.19, 16, 1, "Pt. Maxima Financindo", "CP", 10, 0], ["NASA", "Andalan Perkasa Abadi", 1972.1, 1, 5.07, 14.02, 42.71, 52.59, 0, 79.0, 72.98, 20, 1, "Pt Sinar Cemerlang Jay", "CP", 16, 0], ["TAPG", "Triputra Agro Persada", 1944.7, 1, 5.14, 14.35, 33.07, 71.21, 0, 85.7, 85.65, 21, 0, "Persada Capital Invest", "CP", 6, 0], ["INCF", "Indo Komoditi Korpora", 1929.8, 1, 5.18, 31.63, 40.0, 62.8, 0, 68.4, 68.37, 16, 1, "Alam Tulus Abadi Pt", "CP", 7, 0], ["KKES", "Kusuma Kemindo Sentosa", 1924.6, 1, 5.2, 26.96, 40.8, 62.67, 0, 73.0, 73.04, 16, 1, "Catur Sentosa Adiprana", "CP", 9, 0], ["ABBA", "Mahaka Media", 1914.7, 1, 5.22, 25.33, 40.47, 61.43, 1.02, 62.3, 62.28, 0, 1, "Pt. Beyond Media", "CP", 10, 1], ["TRUS", "Trust Finance Indonesia", 1913.7, 1, 5.23, 2.76, 30.0, 67.32, 0, 67.2, 67.24, 28, 0, "Majujaya Terus Sejahte", "OT", 10, 0], ["CASH", "Cashlez Worldwide Indones", 1908.6, 1, 5.24, 15.09, 33.8, 64.04, 1.98, 82.9, 82.93, 1, 1, "Andri Wijono Sutiono", "ID", 14, 1], ["JIHD", "Jakarta International Hot", 1907.2, 1, 5.24, 14.93, 40.03, 60.25, 12.57, 72.5, 72.5, 4, 1, "Pt Kresna Aji Sembada", "CP", 13, 3], ["EXCL", "Xlsmart Telecom Sejahtera", 1906.6, 1, 5.24, 14.47, 34.69, 64.24, 50.84, 34.7, 34.69, 4, 1, "Axiata Investments (In", "IB", 10, 4], ["HAIS", "Hasnur Internasional Ship", 1905.6, 1, 5.25, 10.21, 40.8, 52.0, 0, 49.0, 48.99, 20, 1, "Nur Internasional Samu", "OT", 13, 0], ["KAYU", "Darmi Bersaudara", 1904.9, 1, 5.25, 20.97, 37.46, 65.76, 6.5, 72.5, 72.53, 0, 1, "Pt Darbe Putra Makmur", "CP", 8, 2], ["TBLA", "Tunas Baru Lampung", 1895.1, 1, 5.28, 10.56, 32.77, 64.2, 26.73, 70.0, 70.05, 4, 1, "Pt Budi Delta Swakarya", "CP", 11, 1], ["BRRC", "Raja Roti Cemerlang", 1893.8, 1, 5.28, 39.03, 42.42, 53.79, 0, 61.0, 60.97, 16, 1, "Ari Sudarsono", "ID", 5, 0], ["BLUE", "Berkah Prima Perkasa", 1892.6, 1, 5.28, 7.71, 28.22, 70.68, 0, 88.0, 88.03, 21, 0, "Pt Cetak Biru Kapital", "CP", 6, 0], ["NIKL", "Pelat Timah Nusantara", 1889.6, 1, 5.29, 11.78, 35.0, 65.42, 55.0, 81.7, 75.11, 5, 1, "Nippon Steel Corporati", "CP", 8, 1], ["SPTO", "Surya Pertiwi", 1888.8, 1, 5.29, 13.38, 30.0, 65.01, 23.76, 71.7, 66.51, 4, 1, "Multifortuna Asindo P", "CP", 12, 5], ["MARI", "Mahaka Radio Integra", 1888.6, 1, 5.29, 43.51, 40.35, 56.49, 0, 56.5, 56.49, 16, 1, "Pt. Beyond Media", "CP", 2, 0], ["BOAT", "Newport Marine Services", 1885.6, 1, 5.3, 9.2, 28.57, 71.43, 0, 90.8, 90.8, 21, 0, "Sujaya Soekarno Putra", "ID", 6, 0], ["NSSS", "Nusantara Sawit Sejahtera", 1876.8, 1, 5.33, 14.09, 39.08, 60.3, 3.46, 80.4, 80.41, 5, 1, "Pt Samuel Tumbuh Bersa", "CP", 11, 2], ["MUTU", "Mutuagung Lestari", 1869.4, 1, 5.35, 21.19, 31.5, 66.82, 0, 78.8, 78.81, 17, 1, "Sentra Mutu Handal", "CP", 7, 0], ["FIRE", "Alfa Energi Investama", 1866.2, 1, 5.36, 32.89, 36.0, 62.34, 0, 52.2, 37.23, 16, 1, "Aris Munandar", "ID", 7, 0], ["BTEK", "Bumi Teknokultura Unggul", 1862.5, 1, 5.37, 34.75, 41.59, 55.3, 45.45, 51.5, 41.59, 0, 2, "Golden Harvest Cocoa L", "CP", 8, 2], ["TECH", "Indosterling Technomedia", 1853.8, 1, 5.39, 8.73, 33.41, 64.62, 43.56, 83.3, 83.31, 5, 1, "Pt. Indosterling Saran", "CP", 9, 3], ["FLMC", "Falmaco Nonwoven Industri", 1830.1, 1, 5.46, 12.61, 39.49, 55.36, 10.77, 87.4, 87.39, 5, 1, "Theresia Indra Wirawan", "ID", 12, 1], ["TFCO", "Tifico Fiber Indonesia", 1829.4, 1, 5.47, 1.25, 33.08, 67.25, 0, 58.8, 58.77, 28, 0, "Prospect Motor", "OT", 11, 0], ["WMUU", "Widodo Makmur Unggas", 1824.1, 1, 5.48, 39.88, 41.78, 52.44, 0, 60.1, 60.12, 16, 1, "Widodo Makmur Perkasa ", "CP", 8, 0], ["WOWS", "Ginting Jaya Energi", 1823.4, 1, 5.48, 49.9, 42.44, 48.62, 0, 48.6, 48.62, 16, 1, "Pt. Ginting Jaya", "CP", 4, 0], ["TNCA", "Trimuda Nuansa Citra", 1823.1, 1, 5.49, 24.93, 31.62, 64.86, 27.49, 72.6, 70.07, 0, 1, "Pt Akulaku Silvrr Indo", "CP", 7, 1], ["INDO", "Royalindo Investa Wijaya", 1812.3, 1, 5.52, 11.15, 32.21, 62.11, 0, 88.8, 88.85, 21, 0, "Leslie Soemedi", "ID", 6, 0], ["MDRN", "Modern Internasional", 1811.1, 1, 5.52, 22.11, 35.23, 64.2, 14.11, 66.2, 65.29, 0, 1, "Sungkono Honoris", "ID", 7, 2], ["BGTG", "Bank Ganesha", 1810.8, 1, 5.52, 9.75, 33.53, 63.25, 34.57, 82.7, 82.66, 5, 1, "Equity Development Inv", "CP", 14, 4], ["AMMN", "Amman Mineral Internasion", 1809.1, 1, 5.53, 9.71, 32.17, 68.54, 8.89, 87.3, 86.74, 5, 1, "Pt Sumber Gemilang Per", "CP", 9, 2], ["DCII", "Dci Indonesia", 1808.5, 1, 5.53, 0.15, 29.9, 66.52, 15.31, 99.8, 99.85, 13, 0, "Otto Toto Sugiri", "ID", 10, 3], ["LION", "Lion Metal Works", 1807.6, 1, 5.53, 8.62, 28.85, 62.58, 90.25, 86.8, 86.77, 5, 1, "Lion Holdings Sdn Bhd", "CP", 11, 3], ["WGSH", "Wira Global Solusi", 1805.1, 1, 5.54, 10.65, 36.96, 60.45, 1.86, 87.5, 87.5, 5, 1, "Walden Global Services", "CP", 13, 1], ["DIVA", "Distribusi Voucher Nusant", 1803.9, 1, 5.54, 17.2, 31.84, 68.96, 8.19, 65.7, 48.68, 0, 2, "Asuransi Jiwa Kresna ", "IS", 7, 1], ["ALTO", "Tri Banyan Tirta", 1797.0, 1, 5.56, 8.72, 36.44, 62.31, 0, 81.7, 81.66, 21, 0, "Pt Fikasa Bintang Ceme", "CP", 13, 0], ["PANS", "Panin Sekuritas", 1791.8, 1, 5.58, 15.77, 30.0, 62.38, 1.39, 52.3, 50.65, 0, 2, "Pt. Patria Nusa Adamas", "CP", 16, 1], ["ROTI", "Nippon Indosari Corpindo", 1786.7, 1, 5.6, 3.81, 25.77, 68.72, 61.3, 94.2, 94.21, 13, 0, "Pt. Indoritel Makmur I", "CP", 8, 5], ["UVCR", "Trimegah Karya Pratama", 1786.1, 1, 5.6, 34.65, 41.22, 51.06, 0, 65.3, 65.35, 16, 1, "Pt Trimegah Sumber Mas", "CP", 9, 0], ["PMMP", "Panca Mitra Multiperdana", 1781.2, 1, 5.61, 30.02, 34.7, 64.38, 0, 70.0, 69.98, 16, 1, "Pt Tiga Makin Jaya", "CP", 5, 0], ["RUNS", "Global Sukses Solusi", 1781.1, 1, 5.61, 13.07, 29.04, 65.54, 0, 77.3, 76.81, 21, 0, "Sony Rachmadi Purnomo", "ID", 12, 0], ["DEWI", "Dewi Shri Farmindo", 1773.7, 1, 5.64, 25.68, 39.0, 57.78, 1.03, 72.0, 72.04, 0, 1, "Aditiya Fajar Junus", "ID", 11, 1], ["BIKE", "Sepeda Bersama Indonesia", 1765.5, 1, 5.66, 8.2, 25.3, 71.22, 0, 91.8, 91.8, 21, 0, "Henry Mulyadi", "ID", 11, 0], ["KOTA", "Dms Propertindo", 1761.6, 1, 5.68, 27.9, 40.78, 50.21, 1.03, 62.6, 57.74, 0, 2, "Dms Investama Pt", "CP", 13, 1], ["JGLE", "Graha Andrasentra Propert", 1761.5, 1, 5.68, 25.95, 38.76, 59.09, 21.36, 51.9, 50.01, 0, 2, "Pt Surya Global Nusant", "CP", 11, 2], ["BSML", "Bintang Samudera Mandiri ", 1758.9, 1, 5.69, 7.62, 36.56, 61.83, 6.2, 86.2, 86.18, 5, 1, "Pt Goldfive Investment", "CP", 15, 3], ["ARNA", "Arwana Citramulia", 1753.3, 1, 5.7, 13.31, 37.32, 59.58, 23.23, 71.1, 63.95, 4, 1, "Tandean Rustandy", "ID", 13, 8], ["KEEN", "Kencana Energi Lestari", 1743.0, 1, 5.74, 10.75, 30.3, 66.32, 25.0, 89.2, 89.25, 5, 1, "Paramata Indah Lestari", "CP", 11, 1], ["PJHB", "Pelayaran Jaya Hidup Baru", 1737.6, 1, 5.76, 27.25, 37.5, 57.75, 0, 72.8, 72.75, 16, 1, "Hero Gozali", "ID", 5, 0], ["SATU", "Kota Satu Properti", 1734.2, 1, 5.77, 5.06, 33.18, 62.24, 1.05, 60.7, 60.71, 4, 1, "Kota Satu Indonesia Pt", "OT", 12, 1], ["BOBA", "Formosa Ingredient Factor", 1729.3, 1, 5.78, 3.49, 28.88, 67.54, 28.54, 96.5, 96.51, 13, 0, "Hengky  Wijaya", "ID", 12, 5], ["PEHA", "Phapros", 1728.2, 1, 5.79, 30.15, 28.39, 67.24, 0, 69.9, 69.85, 16, 1, "Pt Kimia Farma (Perser", "CP", 4, 0], ["GUNA", "Gunanusa Eramandiri", 1719.5, 1, 5.82, 3.78, 24.0, 64.0, 0, 96.2, 96.22, 29, 0, "Tjokro Gunawan", "ID", 9, 0], ["HGII", "Hero Global Investment", 1714.7, 1, 5.83, 11.5, 25.0, 63.55, 27.48, 88.5, 88.5, 5, 1, "Sep International Neth", "CP", 7, 2], ["ASRM", "Asuransi Ramayana", 1712.9, 1, 5.84, 11.24, 31.51, 62.11, 0, 12.8, 12.77, 20, 1, "Syahril", "OT", 9, 0], ["MTLA", "Metropolitan Land", 1708.9, 1, 5.85, 9.53, 36.7, 58.94, 2.83, 76.3, 73.34, 4, 1, "Pt Metropolitan Persad", "CP", 17, 1], ["UNIC", "Unggul Indah Cahaya", 1707.3, 1, 5.86, 2.57, 36.35, 58.08, 0, 97.4, 97.43, 29, 0, "Aspirasi LuhurPt", "CP", 15, 0], ["BAPA", "Bekasi Asri Pemula", 1701.8, 1, 5.88, 28.25, 33.94, 66.63, 0, 57.2, 57.19, 16, 1, "Adicipta Griyasejati ", "CP", 6, 0], ["MTDL", "Metrodata Electronics", 1698.6, 1, 5.89, 15.04, 36.21, 59.24, 9.96, 76.8, 75.0, 0, 1, "Ciputra Corpora. Pt", "CP", 13, 3], ["MPRO", "Maha Properti Indonesia", 1696.8, 1, 5.89, 0.91, 34.22, 55.47, 13.87, 55.5, 55.47, 12, 0, "Jonathan Tahir", "ID", 10, 2], ["SOTS", "Satria Mega Kencana", 1694.4, 1, 5.9, 0.8, 26.0, 64.99, 0, 99.2, 99.2, 29, 0, "Herman Herry Adranacus", "ID", 10, 0], ["BSDE", "Bumi Serpong Damai", 1693.0, 1, 5.91, 16.47, 30.52, 62.95, 9.65, 48.3, 46.43, 0, 2, "Paraga Artamida Pt", "OT", 12, 2], ["BOLA", "Bali Bintang Sejahtera", 1684.3, 1, 5.94, 15.74, 38.26, 53.54, 4.22, 70.0, 59.86, 0, 2, "Pieter Tanuri", "ID", 15, 1], ["RODA", "Pikko Land Development", 1667.9, 1, 6.0, 7.17, 26.52, 63.57, 4.99, 87.8, 87.84, 5, 1, "Nio Yantony", "ID", 10, 1], ["MNCN", "Media Nusantara Citra", 1659.4, 1, 6.03, 39.45, 40.1, 47.04, 11.4, 54.7, 50.66, 0, 2, "Pt Global Mediacom Tbk", "CP", 10, 5], ["CGAS", "Citra Nusantara Gemilang", 1653.9, 1, 6.05, 22.12, 32.32, 62.86, 0, 77.9, 77.88, 17, 1, "Pt Petro Asia Energy", "CP", 8, 0], ["CRAB", "Toba Surimi Industries", 1650.9, 1, 6.06, 2.08, 26.04, 65.28, 0, 97.9, 97.92, 29, 0, "Gindra Tardy", "ID", 11, 0], ["TAYS", "Jaya Swarasa Agung", 1649.4, 1, 6.06, 23.05, 35.93, 58.18, 14.99, 77.0, 76.95, 1, 1, "Anwar Tay", "ID", 8, 1], ["SKBM", "Sekar Bumi", 1648.4, 1, 6.07, 8.28, 32.06, 61.46, 39.11, 9.2, 9.21, 4, 1, "Tael Two Partners Ltd", "OT", 11, 1], ["SNLK", "Sunter Lakeside Hotel", 1645.9, 1, 6.08, 6.44, 36.69, 51.36, 55.21, 88.7, 88.67, 5, 1, "Unilink Ventures Inc.", "CP", 14, 4], ["SULI", "Slj Global", 1644.7, 1, 6.08, 13.64, 35.9, 56.17, 56.95, 66.9, 66.89, 4, 1, "Natureverse Inc. (Pte.", "CP", 14, 4], ["KONI", "Perdana Bangun Pusaka", 1632.7, 1, 6.12, 1.0, 31.26, 58.62, 0, 65.7, 63.75, 28, 0, "Dasabina Adityasarana", "OT", 13, 0], ["GZCO", "Gozco Plantations", 1628.8, 1, 6.14, 23.74, 28.37, 64.59, 12.49, 72.2, 72.23, 0, 1, "Pt. Golden Zaga Indone", "CP", 8, 3], ["LMAX", "Lupromax Pelumas Indonesi", 1627.0, 1, 6.15, 13.7, 33.25, 60.55, 0, 86.3, 86.3, 21, 0, "Kartiko Soemargono", "ID", 10, 0], ["SINI", "Singaraja Putra", 1620.8, 1, 6.17, 21.68, 30.0, 65.23, 15.49, 78.3, 78.32, 1, 1, "Pt. Autum Prima Indone", "CP", 6, 1], ["BJBR", "Bank Jabar Banten", 1613.2, 1, 6.2, 27.71, 38.52, 50.71, 0, 4.6, 0, 16, 1, "Pemda Provinsi Jawa Ba", "OT", 14, 0], ["GGRP", "Gunung Raja Paksi", 1597.3, 1, 6.26, 3.38, 23.53, 64.27, 4.35, 93.6, 93.62, 13, 0, "Pt Apollo Visintama Pu", "CP", 10, 1], ["DOID", "Buma Internasional Grup", 1596.1, 1, 6.27, 25.83, 38.22, 48.77, 58.38, 13.5, 13.5, 0, 2, "Northstar Tambang Pers", "OT", 12, 4], ["ARTO", "Bank Jago", 1578.5, 1, 6.34, 20.32, 29.79, 62.87, 27.23, 59.7, 59.72, 0, 2, "Metamorfosis Ekosistem", "CP", 7, 4], ["NUSA", "Sinergi Megah Internusa", 1574.3, 1, 6.35, 20.64, 38.01, 47.25, 0, 20.6, 14.26, 16, 1, "Jaksa Agung Muda Bidan", "OT", 17, 0], ["MEJA", "Harta Djaya Karya", 1565.2, 1, 6.39, 53.11, 39.31, 44.77, 0, 46.9, 46.89, 16, 1, "Triple Berkah Bersama", "CP", 5, 0], ["APEX", "Apexindo Pratama Duta", 1558.9, 1, 6.41, 26.43, 31.76, 59.74, 31.93, 47.2, 47.21, 0, 2, "Pt Aserra Capital", "CP", 9, 2], ["RAFI", "Sari Kreasi Boga", 1558.5, 1, 6.42, 35.34, 38.36, 47.6, 0, 26.3, 26.3, 16, 1, "Globalasia Capital Inv", "OT", 11, 0], ["BCIP", "Bumi Citra Permai", 1548.0, 1, 6.46, 30.77, 38.07, 46.83, 0, 58.9, 52.5, 16, 1, "Pt Bumi Citra Investin", "CP", 13, 0], ["EURO", "Estee Gold Feet", 1535.3, 1, 6.51, 7.86, 35.7, 50.06, 3.12, 87.2, 87.24, 5, 1, "Timmsvale Pt", "CP", 17, 1], ["PPRI", "Paperocks Indonesia", 1531.8, 1, 6.53, 22.82, 26.05, 62.31, 0, 77.2, 77.18, 17, 1, "Philip Sumali", "ID", 5, 0], ["MAHA", "Mandiri Herindo Adiperkas", 1526.0, 1, 6.55, 12.41, 34.5, 51.28, 0, 87.6, 87.59, 21, 0, "Edika Agung Mandiri Pt", "CP", 11, 0], ["LUCK", "Sentral Mitra Informatika", 1505.5, 1, 6.64, 24.76, 29.2, 58.73, 16.84, 73.3, 73.33, 0, 1, "Caroline Himawati Hida", "ID", 5, 1], ["PNGO", "Pinago Utama", 1494.0, 0, 6.69, 1.74, 22.76, 59.85, 0, 98.3, 98.26, 29, 0, "Wilson Sutantio", "ID", 15, 0], ["ELIT", "Data Sinergitama Jaya", 1479.4, 0, 6.76, 25.08, 27.42, 63.81, 0, 24.5, 24.49, 16, 1, "Gratus Deo Indonesia ", "OT", 7, 0], ["DEFI", "Danasupra Erapacific", 1475.4, 0, 6.78, 9.11, 23.57, 59.42, 4.92, 64.6, 52.85, 4, 1, "Asuransi Jiwa Kresna ", "IS", 11, 1], ["DMMX", "Digital Mediatama Maxima", 1468.4, 0, 6.81, 14.68, 27.65, 60.35, 16.36, 71.4, 71.43, 4, 1, "Pt Nfc Indonesia Tbk", "CP", 10, 1], ["MPXL", "Mpx Logistics Internation", 1468.2, 0, 6.81, 10.38, 22.0, 62.71, 0, 75.6, 75.62, 21, 0, "Ye Hun Ki", "ID", 10, 0], ["GMTD", "Gowa Makassar Tourism Dev", 1466.9, 0, 6.82, 2.63, 32.5, 52.0, 0, 9.1, 9.06, 28, 0, "Makassar Permata Sulaw", "OT", 16, 0], ["AKPI", "Argha Karya Prima Industr", 1463.4, 0, 6.83, 2.54, 23.03, 59.32, 0, 74.4, 74.43, 28, 0, "Tiara Intimahkota", "OT", 14, 0], ["TRIM", "Trimegah Sekuritas Indone", 1458.1, 0, 6.86, 8.47, 34.68, 48.35, 12.08, 77.4, 77.4, 5, 1, "Garibaldi Thohir", "ID", 18, 2], ["IKAN", "Era Mandiri Cemerlang", 1449.5, 0, 6.9, 47.1, 33.52, 52.9, 0, 52.9, 52.9, 16, 1, "Pt Berkah Delapan Samu", "CP", 3, 0], ["UNTD", "Terang Dunia Internusa", 1427.2, 0, 7.01, 8.97, 22.5, 58.12, 0, 91.0, 91.03, 21, 0, "Tan Tjoe Ing", "ID", 12, 0], ["PNIN", "Paninvest", 1416.1, 0, 7.06, 18.24, 29.71, 57.67, 15.81, 14.9, 11.94, 0, 2, "Paninkorp Pt", "OT", 11, 1], ["BINA", "Bank Ina Perdana", 1406.5, 0, 7.11, 5.17, 21.83, 56.85, 28.84, 55.1, 34.57, 4, 1, "Pt. Indolife Pensionta", "IS", 10, 2], ["MLPL", "Multipolar", 1405.4, 0, 7.12, 34.11, 32.13, 58.11, 20.47, 47.1, 47.07, 0, 2, "Bank Julius Baer Co. L", "CP", 7, 2], ["SBAT", "Sejahtera Bintang Abadi T", 1401.1, 0, 7.14, 41.12, 34.48, 50.46, 1.18, 58.9, 58.88, 0, 2, "Tan Heng Lok", "ID", 9, 1], ["PTSP", "Pioneerindo Gourmet Inter", 1400.0, 0, 7.14, 3.78, 27.63, 55.66, 59.69, 46.5, 46.5, 12, 0, "Pt. Graha Sentosa Pers", "CP", 11, 3], ["YELO", "Yelooo Integra Datanet", 1400.0, 0, 7.14, 61.5, 37.4, 38.5, 0, 38.5, 38.5, 16, 1, "Pt Artalindo Semesta N", "CP", 2, 0], ["SMRA", "Summarecon Agung", 1368.4, 0, 7.31, 36.99, 35.8, 44.88, 10.12, 51.6, 50.25, 0, 2, "Pt Semarop Agung", "CP", 11, 3], ["BBYB", "Bank Neo Commerce", 1365.1, 0, 7.33, 34.97, 34.45, 50.5, 11.63, 62.8, 62.0, 0, 1, "Pt Akulaku Silvrr Indo", "CP", 10, 3], ["UNIQ", "Ulima Nitra", 1363.5, 0, 7.33, 14.34, 22.52, 56.99, 0, 85.7, 85.66, 21, 0, "Burhan Tjokro", "ID", 8, 0], ["MINA", "Sanurhasta Mitra", 1362.3, 0, 7.34, 38.8, 30.48, 55.49, 0, 61.2, 61.2, 16, 1, "Pt Basis Utama Prima", "CP", 5, 0], ["OASA", "Maharaksa Biru Energi", 1360.6, 0, 7.35, 32.33, 35.25, 45.49, 6.65, 60.0, 60.0, 0, 2, "Gafur Sulistyo UmarIr", "ID", 14, 2], ["TRIS", "Trisula International", 1360.5, 0, 7.35, 4.48, 20.16, 52.44, 7.58, 87.3, 86.69, 13, 0, "Pt. Inti Nusa Damai", "CP", 12, 2], ["RUIS", "Radiant Utama Interinsco", 1356.2, 0, 7.37, 21.12, 23.97, 60.43, 13.82, 65.1, 65.06, 0, 1, "Haiyanto", "ID", 8, 1], ["HOPE", "Harapan Duta Pertiwi", 1355.4, 0, 7.38, 23.13, 32.27, 51.14, 0, 76.9, 76.87, 17, 1, "Pt. Harapan Group Suks", "CP", 11, 0], ["IPPE", "Indo Pureco Pratama", 1355.3, 0, 7.38, 34.6, 35.22, 46.52, 0, 65.4, 65.4, 16, 1, "Lembur Sadaya Investam", "CP", 12, 0], ["SPRE", "Soraya Berjaya Indonesia", 1352.6, 0, 7.39, 25.15, 27.83, 59.51, 0, 74.8, 74.85, 16, 1, "Rizet Ramawi", "ID", 8, 0], ["MAYA", "Bank Mayapada Internasion", 1345.6, 0, 7.43, 5.48, 24.16, 55.78, 24.1, 29.9, 25.57, 4, 1, "Mayapada Karunia Pt", "OT", 11, 3], ["PBRX", "Pan Brothers", 1342.3, 0, 7.45, 33.05, 31.07, 54.02, 25.88, 61.0, 61.03, 0, 1, "Trisetijo Manunggal Ut", "CP", 10, 4], ["SUPA", "Super Bank Indonesia", 1341.7, 0, 7.45, 27.58, 27.6, 59.01, 26.32, 61.8, 61.84, 0, 1, "Pt Elang Media Visitam", "CP", 6, 2], ["JAST", "Jasnita Telekomindo", 1337.6, 0, 7.48, 40.22, 29.95, 54.51, 29.95, 29.8, 29.83, 0, 2, "Uob Kay Hian Private L", "SC", 6, 1], ["GOOD", "Garudafood Putra Putri Ja", 1326.5, 0, 7.54, 5.23, 30.17, 49.67, 30.17, 94.8, 94.77, 5, 0, "Hormel Foods Internati", "CP", 17, 1], ["TOYS", "Sunindo Adipersada", 1323.4, 0, 7.56, 34.33, 28.86, 54.8, 5.28, 65.7, 65.67, 0, 1, "Iwan Tirtha", "ID", 8, 1], ["NINE", "Techno9 Indonesia", 1322.8, 0, 7.56, 53.49, 35.85, 43.73, 35.85, 46.5, 46.51, 0, 2, "Poh Holdings Pte Ltd", "CP", 5, 1], ["TMPO", "Tempo Inti Media", 1316.3, 0, 7.6, 15.7, 24.28, 57.69, 3.12, 25.4, 25.37, 0, 2, "Pt.Grafiti Pers", "CP", 9, 1], ["ASRI", "Alam Sutera Realty", 1311.5, 0, 7.62, 25.99, 25.72, 55.4, 0, 64.1, 64.11, 16, 1, "Pt. Tangerang Fajar In", "CP", 9, 0], ["BNBR", "Bakrie And Brothers", 1300.3, 0, 7.69, 11.01, 24.31, 54.95, 50.24, 49.9, 49.88, 4, 1, "Port Fraser Internatio", "CP", 13, 4], ["EPAC", "Megalestari Epack Sentosa", 1298.4, 0, 7.7, 16.82, 24.22, 58.78, 0, 83.2, 83.18, 17, 1, "Pt Omni Multi Industri", "CP", 12, 0], ["STAR", "Buana Artha Anugerah", 1288.6, 0, 7.76, 7.2, 32.19, 42.11, 50.62, 76.2, 72.3, 4, 1, "Calculus Investment Pt", "CP", 18, 4], ["COAL", "Black Diamond Resources", 1277.9, 0, 7.83, 50.16, 34.89, 44.89, 0, 49.8, 49.84, 16, 1, "Sujaka Lays", "ID", 6, 0], ["BMTR", "Global Mediacom", 1259.1, 0, 7.94, 40.78, 34.32, 44.86, 3.36, 52.8, 52.79, 0, 2, "Pt. Mnc Asia Holding T", "CP", 13, 3], ["UDNG", "Agro Bahari Nusantara", 1258.1, 0, 7.95, 6.78, 22.71, 50.99, 1.33, 91.9, 91.89, 5, 0, "Jose Loupiga Keliat", "ID", 13, 1], ["KBLV", "First Media", 1257.0, 0, 7.96, 46.25, 33.76, 46.96, 0, 53.8, 53.75, 16, 1, "Pt Reksa Puspita Karya", "CP", 6, 0], ["BISI", "Bisi International", 1243.9, 0, 8.04, 12.67, 31.0, 43.72, 43.61, 46.5, 46.53, 4, 1, "Agrindo Pratama", "CP", 14, 5], ["TRST", "Trias Sentosa", 1242.0, 0, 8.05, 11.13, 26.71, 52.33, 4.73, 70.4, 69.79, 4, 1, "Pt. K And L Capital", "CP", 14, 2], ["VIVA", "Visi Media Asia", 1235.3, 0, 8.1, 30.37, 32.94, 43.78, 30.25, 39.4, 39.38, 0, 2, "Pt. Bakrie Global Vent", "CP", 12, 4], ["VTNY", "Venteny Fortuna Internati", 1227.6, 0, 8.15, 12.82, 21.06, 52.22, 59.18, 87.2, 87.18, 5, 1, "Carta Holdings Co. Lt", "CP", 9, 2], ["ARII", "Atlas Resources", 1213.5, 0, 8.24, 11.75, 29.08, 49.85, 14.78, 79.3, 77.03, 5, 1, "Pt. Calorie Viva Utama", "CP", 15, 1], ["ARTI", "Ratu Prabu Energi", 1211.0, 0, 8.26, 46.08, 33.06, 46.9, 0, 46.5, 39.08, 16, 1, "Ratu Prabu Pt", "CP", 8, 0], ["BAJA", "Saranacentral Bajatama", 1208.8, 0, 8.27, 8.85, 16.47, 49.37, 0, 91.1, 91.15, 21, 0, "Pandji Surya Soerjopra", "ID", 11, 0], ["LPPF", "Matahari Department Store", 1208.4, 0, 8.28, 22.08, 29.23, 51.81, 49.59, 62.4, 62.37, 0, 1, "Auric Digital Retail P", "CP", 12, 2], ["WIIM", "Wismilak Inti Makmur", 1207.7, 0, 8.28, 21.45, 25.48, 55.86, 0, 78.5, 78.55, 17, 1, "Indahtati Widjajadi", "ID", 10, 0], ["INAI", "Indal Aluminium Industry", 1192.6, 0, 8.39, 13.41, 29.22, 46.02, 0, 80.3, 80.32, 21, 0, "Pt Husin Investama", "CP", 14, 0], ["ASHA", "Cilacap Samudera Fishing ", 1192.5, 0, 8.39, 25.03, 30.0, 48.5, 0, 75.0, 74.97, 16, 1, "Pt Asha Fortuna Corpor", "CP", 10, 0], ["DSNG", "Dharma Satya Nusantara", 1179.1, 0, 8.48, 13.27, 28.33, 48.39, 5.84, 80.9, 80.89, 5, 1, "Triputra Investindo Ar", "CP", 17, 1], ["KIOS", "Kioson Komersial Indonesi", 1169.5, 0, 8.55, 40.07, 32.56, 44.35, 1.86, 53.8, 49.53, 0, 2, "Pt Artav Mobile Indone", "CP", 11, 1], ["COIN", "Indokripto Koin Semesta", 1153.7, 0, 8.67, 12.36, 23.98, 51.84, 0, 85.6, 85.64, 21, 0, "Megah Perkasa Investin", "CP", 15, 0], ["BIRD", "Blue Bird", 1151.3, 0, 8.69, 16.53, 28.37, 46.65, 1.98, 83.5, 83.47, 1, 1, "Pt. Pusaka Citra Djoko", "CP", 14, 1], ["LEAD", "Logindo Samudramakmur", 1146.2, 0, 8.72, 28.76, 23.19, 50.87, 29.62, 64.3, 64.26, 0, 1, "Pt Jalan Terang Samudr", "CP", 10, 1], ["KUAS", "Ace Oldfields", 1144.6, 0, 8.74, 27.5, 27.3, 51.85, 0, 45.2, 45.2, 16, 1, "Grace Capital Investme", "OT", 9, 0], ["BAYU", "Bayu Buana", 1125.5, 0, 8.88, 11.83, 28.08, 46.05, 46.47, 46.2, 43.53, 4, 1, "Pt. Graha Sentosa Pers", "CP", 15, 2], ["INTA", "Intraco Penta", 1101.9, 0, 9.08, 12.18, 22.93, 50.85, 1.6, 84.2, 84.19, 5, 1, "Petrus Halim", "ID", 17, 1], ["DGWG", "Delta Giri Wacana", 1100.2, 0, 9.09, 46.04, 30.09, 47.22, 0, 41.4, 41.43, 16, 1, "David Yaory", "ID", 6, 0], ["BEBS", "Berkah Beton Sadaya", 1095.3, 0, 9.13, 38.3, 31.39, 42.09, 5.38, 56.3, 56.32, 0, 2, "Pt Berkah Global Inves", "CP", 13, 2], ["LPKR", "Lippo Karawaci", 1093.6, 0, 9.14, 23.63, 25.79, 52.07, 35.38, 64.2, 64.18, 0, 1, "Bank Julius Baer Co. L", "CP", 14, 6], ["RELF", "Graha Mitra Asia", 1092.9, 0, 9.15, 19.74, 19.44, 47.5, 0, 80.3, 80.26, 17, 1, "Pt. Relife Property", "CP", 7, 0], ["NATO", "Surya Permata Andalan", 1090.1, 0, 9.17, 3.47, 26.87, 42.46, 29.79, 95.9, 95.28, 13, 0, "Pt Mercury Strategic I", "CP", 18, 3], ["EMTK", "Elang Mahkota Teknologi", 1046.1, 0, 9.56, 15.54, 21.88, 47.56, 15.33, 77.2, 77.25, 1, 1, "Rd Eddy K Sariaatmadja", "ID", 11, 2], ["LMSH", "Lionmesh Prima", 1042.8, 0, 9.59, 9.76, 25.55, 46.19, 59.16, 90.2, 90.24, 5, 0, "Lion Holdings Private ", "CP", 15, 4], ["RGAS", "Kian Santang Muliatama", 1041.2, 0, 9.6, 20.65, 17.35, 46.27, 0, 79.4, 79.35, 17, 1, "Agus Salim", "ID", 8, 0], ["BOGA", "Apollo Global Interactive", 1032.6, 0, 9.68, 11.46, 29.5, 38.57, 31.6, 66.8, 52.04, 4, 1, "Gx Archipelago Pte.Ltd", "CP", 27, 2], ["INCI", "Intanwijaya Internasional", 1018.9, 0, 9.81, 16.42, 18.8, 51.35, 0, 83.6, 83.58, 17, 1, "Tamzil Tanmizi", "ID", 12, 0], ["ICON", "Island Concepts Indonesia", 1007.3, 0, 9.93, 12.53, 19.08, 49.3, 3.05, 58.7, 56.15, 4, 1, "Prof.Dr.Ir. Anastasia ", "OT", 13, 2], ["ASSA", "Adi Sarana Armada", 1001.5, 0, 9.99, 23.28, 23.08, 50.01, 9.65, 70.3, 69.64, 0, 1, "Adi Dinamika Investind", "CP", 15, 4], ["VKTR", "Vktr Teknologi Mobilitas", 968.8, 0, 10.32, 11.27, 24.4, 43.97, 12.82, 75.7, 72.2, 4, 1, "Bakrie & Brothers Tbk", "CP", 20, 3], ["WINS", "Wintermar Offshore Marine", 960.8, 0, 10.41, 18.97, 25.55, 41.88, 12.53, 71.3, 70.26, 0, 1, "Wintermarjaya Lestari ", "CP", 16, 1], ["ASMI", "Asuransi Maximus Graha Pe", 951.9, 0, 10.51, 48.92, 29.96, 36.89, 0, 36.1, 21.12, 16, 1, "Asuransi Jiwa Kresna ", "IS", 11, 0], ["SKYB", "Northcliff Citranusa Indo", 940.3, 0, 10.63, 8.45, 18.37, 44.14, 44.26, 55.0, 42.65, 4, 1, "Jpmcb Na Re-Ora Pro No", "CP", 14, 2], ["BMBL", "Lavender Bina Cendikia", 915.6, 0, 10.92, 32.69, 25.12, 43.98, 0, 67.3, 67.31, 16, 1, "Pt. Ammar Al Amanah", "CP", 10, 0], ["BHAT", "Bhakti Multi Artha", 913.8, 0, 10.94, 6.09, 25.1, 36.01, 23.34, 83.0, 77.33, 5, 1, "Pt Bhakti Artha Global", "CP", 21, 3], ["GAMA", "Aksara Global Development", 901.8, 0, 11.09, 5.29, 24.0, 36.0, 2.77, 83.6, 75.2, 5, 1, "Pt.Gading Investments", "CP", 19, 1], ["RICY", "Ricky Putra Globalindo", 894.1, 0, 11.18, 22.7, 19.48, 48.04, 7.75, 23.2, 23.2, 0, 2, "Spanola Holdings Ltd.", "OT", 13, 2], ["MREI", "Maskapai Reasuransi Indon", 874.6, 0, 11.43, 9.04, 20.53, 41.77, 43.84, 58.0, 50.57, 4, 1, "Pt. Graha Sentosa Pers", "CP", 18, 4], ["WSBP", "Waskita Beton Precast", 872.6, 0, 11.46, 51.64, 28.21, 38.36, 0, 48.4, 48.36, 16, 1, "Pt. Waskita Karya A/C ", "CP", 9, 0], ["CITY", "Natura City Developments", 862.8, 0, 11.59, 5.88, 20.63, 39.96, 0, 35.7, 35.67, 20, 1, "Pt Sakti Generasi Perd", "CP", 15, 0], ["BRMS", "Bumi Resources Minerals", 862.0, 0, 11.6, 23.46, 25.1, 40.16, 45.59, 22.4, 19.63, 0, 2, "Emirates Tarian Global", "OT", 17, 4], ["PURE", "Trinitan Metals And Miner", 843.0, 0, 11.86, 52.53, 26.45, 40.93, 0, 36.6, 36.63, 16, 1, "Pt Trinitan Resourceta", "CP", 7, 0], ["SRSN", "Indo Acidatama", 827.4, 0, 12.09, 16.97, 14.15, 38.26, 2.22, 80.8, 80.81, 1, 1, "Budhi Bersaudara Manun", "CP", 11, 1], ["POOL", "Pool Advista Indonesia", 825.6, 0, 12.11, 46.01, 26.73, 39.09, 0, 16.9, 9.15, 16, 1, "Jaksa Agung Muda Bidan", "OT", 11, 0], ["KPIG", "Mnc Land", 814.7, 0, 12.27, 19.5, 18.72, 43.26, 46.34, 51.4, 51.44, 0, 2, "Pt. Mnc Asia Holding T", "CP", 17, 3], ["PCAR", "Prima Cakrawala Abadi", 800.0, 0, 12.5, 33.2, 26.19, 36.19, 0, 43.5, 20.19, 16, 1, "Perusahaan Perseroan (", "IS", 19, 0], ["LABA", "Green Power Group", 793.9, 0, 12.6, 60.49, 25.54, 38.47, 0, 39.5, 39.51, 16, 1, "Pt Nev Stored Energy", "CP", 4, 0], ["UNIT", "Cahaya Permata Sejahtera", 787.4, 0, 12.7, 14.74, 21.78, 34.36, 29.4, 72.8, 72.75, 4, 1, "Pt. Lenovo Worldwide C", "CP", 16, 2], ["HOME", "Hotel Mandarine Regency", 780.1, 0, 12.82, 33.84, 24.67, 38.34, 0, 16.9, 11.56, 16, 1, "Jaksa Agung Muda Bidan", "OT", 17, 0], ["ZINC", "Kapuas Prima Coal", 749.5, 0, 13.34, 29.45, 14.42, 36.9, 5.14, 65.4, 65.41, 0, 1, "Sim Antony", "ID", 8, 1], ["ARMY", "Armidian Karyatama", 733.0, 0, 13.64, 20.42, 20.46, 39.24, 6.55, 53.0, 41.52, 0, 2, "Mandiri Mega Jaya Pt", "CP", 19, 2], ["APIC", "Pacific Strategic Financi", 709.6, 0, 14.09, 18.37, 20.27, 37.22, 8.88, 71.9, 71.9, 0, 1, "Pan Pacific Investama", "CP", 17, 3], ["MTFN", "Capitalinc Investment", 707.8, 0, 14.13, 29.28, 21.1, 39.64, 37.87, 35.4, 33.45, 0, 2, "Express Profitable Inv", "OT", 18, 3], ["MKNT", "Mitra Komunikasi Nusantar", 701.8, 0, 14.25, 26.74, 22.63, 33.89, 3.17, 63.8, 57.53, 0, 2, "Pt Monjess Investama", "CP", 18, 1], ["CTTH", "Citatah", 699.0, 0, 14.31, 27.92, 18.9, 36.91, 19.6, 22.0, 22.02, 0, 2, "Parallax Venture Partn", "OT", 11, 2], ["KRYA", "Bangun Karya Perkasa Jaya", 695.5, 0, 14.38, 47.58, 21.77, 40.23, 21.77, 52.4, 52.42, 0, 2, "Green City Sg Pte Ltd", "CP", 6, 1], ["BTEL", "Bakrie Telecom", 695.3, 0, 14.38, 23.6, 16.81, 38.93, 9.52, 56.8, 53.89, 0, 2, "Pt. Huawei Tech Invest", "CP", 16, 2], ["DILD", "Intiland Development", 693.9, 0, 14.41, 31.59, 15.02, 40.82, 24.26, 26.1, 26.09, 0, 2, "Cgs International Secu", "IB", 12, 1], ["MABA", "Marga Abhinaya Abadi", 681.4, 0, 14.68, 22.9, 16.62, 38.71, 0, 44.6, 31.88, 16, 1, "Jaksa Agung Muda Bidan", "OT", 17, 0], ["MDLN", "Modernland Realty", 678.7, 0, 14.73, 22.64, 15.29, 38.6, 23.76, 46.1, 46.14, 0, 2, "Panin Sekuritas Tbk P", "SC", 17, 3], ["ESSA", "Essa Industries Indonesia", 676.9, 0, 14.77, 27.23, 16.38, 38.77, 13.57, 57.2, 57.21, 0, 2, "Chander Vinod Laroya", "ID", 14, 3], ["SMKM", "Sumber Mas Konstruksi", 672.2, 0, 14.88, 58.98, 25.0, 33.06, 28.03, 38.9, 37.99, 0, 2, "Lim Shrimp Org Pte. Lt", "CP", 8, 3], ["BIPI", "Astrindo Nusantara Infras", 661.7, 0, 15.11, 30.57, 19.39, 38.1, 24.04, 41.9, 39.95, 0, 2, "Pt Indotambang Perkasa", "CP", 17, 4], ["MDKA", "Merdeka Copper Gold", 660.6, 0, 15.14, 36.75, 19.37, 38.71, 4.93, 57.5, 55.71, 0, 2, "Saratoga Investama Sed", "CP", 12, 1], ["MCAS", "M Cash Integrasi", 643.7, 0, 15.54, 16.91, 13.48, 34.45, 33.27, 61.3, 61.29, 0, 1, "Pt. 1 Inti Dot Com", "CP", 18, 3], ["KIJA", "Kawasan Industri Jababeka", 638.3, 0, 15.67, 42.24, 21.09, 36.46, 16.61, 34.6, 33.39, 0, 2, "Mu Min Ali Gunawan", "ID", 15, 3], ["ENRG", "Energi Mega Persada", 629.4, 0, 15.89, 26.22, 17.42, 36.76, 6.45, 41.9, 41.92, 0, 2, "Pt Shima Global Kapita", "CP", 17, 1], ["RIMO", "Rimo International Lestar", 614.4, 0, 16.28, 27.83, 18.18, 37.16, 16.67, 28.8, 17.14, 0, 2, "Jaksa Agung Muda Bidan", "OT", 19, 3], ["UNSP", "Bakrie Sumatera Plantatio", 598.4, 0, 16.71, 41.19, 17.82, 37.99, 11.18, 53.1, 52.37, 0, 2, "Pt Bakrie Capital Indo", "CP", 11, 3], ["KLBF", "Kalbe Farma", 592.8, 0, 16.87, 30.12, 10.47, 30.86, 3.78, 66.3, 64.09, 0, 1, "Pt Ladang Ira Panen", "CP", 11, 2], ["TARA", "Agung Semesta Sejahtera", 577.8, 0, 17.31, 10.25, 15.04, 31.42, 10.9, 79.7, 70.82, 4, 1, "Pt.Surya Buana Makmur", "CP", 23, 1], ["FIMP", "Fimperkasa Utama", 576.0, 0, 17.36, 4.96, 13.82, 29.79, 0, 95.0, 95.04, 29, 0, "Pt. Bangun Bumi Utama", "CP", 22, 0], ["IIKP", "Inti Agri Resources", 566.4, 0, 17.66, 22.11, 15.22, 34.57, 4.9, 41.8, 19.3, 0, 2, "Perusahaan Perseroan (", "IS", 19, 1], ["AKKU", "Anugerah Kagum Karya Utam", 565.4, 0, 17.69, 16.45, 16.08, 33.38, 4.15, 82.4, 82.43, 1, 1, "Pt. Renaldijaya Ekaint", "CP", 24, 2], ["JSKY", "Sky Energy Indonesia", 555.4, 0, 18.01, 55.11, 20.34, 34.86, 4.55, 10.0, 10.0, 0, 2, "Jaksa Agung Muda Bidan", "OT", 8, 2], ["PURA", "Putra Rajawali Kencana", 519.7, 0, 19.24, 38.31, 15.28, 34.87, 4.73, 57.0, 56.96, 0, 2, "Pt Rajawali Inti", "CP", 15, 1], ["INPC", "Bank Artha Graha Internas", 511.9, 0, 19.54, 6.66, 14.38, 27.65, 14.63, 71.3, 71.31, 4, 1, "Pt Cakra Inti Utama", "CP", 28, 2], ["BHIT", "Mnc Asia Holding", 508.1, 0, 19.68, 22.99, 15.38, 31.16, 62.77, 58.6, 58.55, 0, 2, "Ht Investment Developm", "CP", 20, 4], ["KREN", "Quantum Clovera Investama", 497.9, 0, 20.08, 41.63, 14.57, 32.97, 1.16, 51.5, 44.6, 0, 2, "Pt Kresna Prima Invest", "CP", 14, 1], ["DADA", "Diamond Citra Propertindo", 469.2, 0, 21.31, 73.76, 21.53, 24.15, 1.08, 25.2, 25.16, 0, 2, "Pt Karya Permata Inova", "CP", 5, 1], ["BLTA", "Berlian Laju Tanker", 469.1, 0, 21.32, 45.24, 17.41, 31.2, 13.28, 31.9, 30.94, 0, 2, "Tunggaladhi Baskara P", "CP", 14, 3], ["SSIA", "Surya Semesta Internusa", 449.2, 0, 22.26, 42.32, 10.24, 28.8, 11.48, 44.4, 44.36, 0, 2, "Pt Dwimuria Investama ", "CP", 10, 2], ["HEAL", "Medikaloka Hermina", 435.0, 0, 22.99, 22.48, 12.95, 26.6, 11.32, 75.2, 75.24, 1, 1, "Pt Astra Healthcare In", "CP", 22, 2], ["MENN", "Menn Teknologi Indonesia", 417.2, 0, 23.97, 51.87, 18.37, 27.65, 1.36, 48.1, 48.13, 0, 2, "Jora Nilam Judge", "ID", 15, 1], ["BULL", "Buana Lintas Lautan", 409.0, 0, 24.45, 45.17, 14.53, 30.46, 21.84, 33.9, 33.87, 0, 2, "Pt Delta Royal Sejahte", "CP", 15, 3], ["SUGI", "Sugih Energy Pt", 401.2, 0, 24.93, 32.23, 11.52, 27.28, 35.54, 32.8, 23.88, 0, 2, "Asiaciti Trust Singapo", "OT", 18, 4], ["IKAI", "Intikeramik Alamasri Indu", 399.1, 0, 25.06, 70.32, 19.34, 25.47, 0, 29.0, 28.32, 16, 1, "Mahkota Properti Indo ", "CP", 6, 0], ["TGRA", "Terregra Asia Energy", 376.2, 0, 26.58, 44.12, 16.46, 25.06, 0, 45.3, 41.76, 16, 1, "Terregra Asia Equity ", "CP", 20, 0], ["PLAS", "Polaris Investama", 370.9, 0, 26.96, 24.14, 8.49, 21.81, 17.28, 46.1, 40.21, 0, 2, "Ubs Ag London", "IB", 21, 3], ["YULE", "Yulie Sekuritas Indonesia", 364.1, 0, 27.46, 35.16, 11.08, 25.52, 12.26, 38.5, 37.85, 0, 2, "Pt Yulie Sekuritas Ind", "SC", 18, 2], ["BOSS", "Borneo Olah Sarana Sukses", 339.9, 0, 29.42, 49.32, 13.58, 28.84, 1.45, 49.2, 47.77, 0, 2, "Pt Megah Prakarsa Utam", "CP", 17, 1], ["MIRA", "Mitra International Resou", 323.0, 0, 30.96, 41.14, 11.67, 22.41, 0, 57.7, 57.72, 16, 1, "Pt. Inti  Kencana Pran", "CP", 16, 0], ["DEWA", "Darma Henwa", 317.1, 0, 31.54, 45.16, 9.38, 23.71, 23.5, 28.2, 28.16, 0, 2, "Goldwave Capital Limit", "OT", 13, 4], ["SIMA", "Siwani Makmur", 315.8, 0, 31.67, 47.97, 12.05, 23.86, 0, 14.6, 4.35, 16, 1, "Jaksa Agung Muda Bidan", "OT", 12, 0], ["LCGP", "Eureka Prima Jakarta", 307.7, 0, 32.5, 25.67, 6.57, 16.92, 4.56, 34.1, 9.7, 0, 2, "Perusahaan Perseroan (", "IS", 22, 1], ["CARS", "Industri Dan Perdagangan ", 277.7, 0, 36.01, 19.77, 4.99, 14.9, 15.09, 67.4, 67.37, 0, 1, "Pt Berjaya Trimakmur S", "CP", 28, 3], ["RMKO", "Royaltama Mulia Kontrakto", 242.9, 0, 41.17, 82.2, 15.4, 17.8, 0, 17.8, 17.8, 16, 1, "Pt Rmk Investama", "CP", 2, 0], ["DUCK", "Jaya Bersama Indo", 237.7, 0, 42.07, 57.61, 9.88, 21.16, 22.56, 22.4, 15.13, 0, 2, "Fidelity Funds", "MF", 10, 4], ["DEAL", "Dewata Freightinternation", 233.1, 0, 42.9, 64.2, 10.25, 24.49, 0, 35.8, 35.8, 16, 1, "Pt. Bimada Paramita Ad", "CP", 11, 0], ["GOTO", "Mvs Goto Gojek Tokopedia", 182.7, 0, 54.73, 51.22, 7.65, 17.9, 37.65, 37.4, 37.36, 0, 2, "Svf Gt Subco (Singapor", "IB", 20, 7], ["LMAS", "Limas Indonesia Makmur", 165.4, 0, 60.46, 69.86, 7.46, 21.22, 0, 30.1, 30.14, 16, 1, "Suparman Tjahaja", "ID", 9, 0], ["HKMU", "Hk Metals Utama", 156.3, 0, 63.98, 56.83, 4.87, 13.57, 0, 40.3, 40.33, 16, 1, "Pt Alam Mubarok Sejaht", "CP", 14, 0], ["ENVY", "Envy Technologies Indones", 123.0, 0, 81.3, 73.79, 7.24, 17.53, 13.68, 15.6, 15.58, 0, 2, "Pt Envy Manajemen Kons", "OT", 8, 3], ["ELTY", "Bakrieland Development", 98.5, 0, 101.52, 69.28, 5.35, 13.94, 9.73, 15.8, 10.58, 0, 2, "Asuransi Simas Jiwa", "IS", 13, 2], ["TAXI", "Express Transindo Utama", 76.4, 0, 130.89, 74.47, 4.89, 12.94, 0, 25.5, 25.53, 16, 1, "Robert", "ID", 12, 0], ["PADI", "Minna Padi Investama Seku", 61.5, 0, 162.6, 82.09, 5.75, 11.8, 0, 17.9, 17.91, 16, 1, "Pt Sentosa Bersama Mit", "CP", 7, 0], ["NCKL", "Trimegah Bangun Persada", 57.9, 0, 172.71, 87.97, 6.5, 12.03, 8.87, 3.2, 3.16, 0, 2, "Glencore International", "OT", 3, 2], ["WIRG", "Wir Asia", 57.8, 0, 173.01, 77.72, 4.8, 10.6, 6.84, 21.3, 21.28, 0, 2, "Florensia Kartini Tedj", "ID", 12, 3], ["BBTN", "Bank Tabungan Negara (Per", 34.7, 0, 288.18, 90.02, 4.95, 8.87, 1.11, 5.0, 0, 0, 2, "Pt Taspen (Persero)", "IS", 4, 1], ["BBNI", "Bank Negara Indonesia", 19.4, 0, 515.46, 92.05, 3.51, 6.78, 1.18, 5.0, 2.09, 0, 2, "Djs Ketenagakerjaan Pr", "IS", 4, 1], ["BBRI", "Bank Rakyat Indonesia (Pe", 15.7, 0, 636.94, 94.14, 3.63, 5.86, 1.14, 1.1, 0, 0, 2, "Indonesia Investment A", "OT", 3, 1], ["ADHI", "Adhi Karya (Persero)", 14.8, 0, 675.68, 92.63, 2.68, 6.23, 0, 4.7, 4.69, 16, 1, "Panin Sekuritas Tbk P", "SC", 4, 0]];
const FL = ["Insider>75%", "SingleCP>50%", "LowFloat<15%", "CritFloat<5%", "ZeroForeign"];
const HL = ["Low", "Moderate", "High"];
const TR = ["Red", "Amber", "Green"];
const RAW = _D.map(r => ({
    code: r[0], issuer: r[1], hhi: r[2], hl: HL[r[3]], ens: r[4], ff: r[5],
    c1: r[6], c3: r[7], fr: r[8], ss: r[9], ip: r[10],
    flags: FL.filter((_, i) => r[11] & (1 << i)),
    tier: TR[r[12]], th: r[13], tht: r[14], hc: r[15], nd: r[16]
}));


const TIER_COLOR = { Red: "#E76F51", Amber: "#E9C46A", Green: "#2A9D8F" };
const HHI_COLOR = { High: "#E76F51", Moderate: "#E9C46A", Low: "#2A9D8F" };
const FLAG_DEFS = {
    "Insider>75%": "Combined stake of corporate & individual insiders exceeds 75% of shares",
    "SingleCP>50%": "A single corporate entity holds more than 50% of shares",
    "LowFloat<15%": "Free float below IDX minimum listing guideline of 15%",
    "CriticalFloat<5%": "Extremely thin float under 5% — virtually illiquid for institutional trading",
    "ZeroForeign": "No foreign investor holds a reportable position in this stock"
};
const METRIC_DEFS = {
    HHI: "Herfindahl-Hirschman Index: sum of squared stakes. <1,500 = competitive, 2,500+ = highly concentrated.",
    ENS: "Effective Number of Shareholders: 10,000 ÷ HHI. Represents equivalent number of equal-stake holders.",
    "Free Float": "Percentage of shares not held by major (>1%) shareholders. IDX guideline minimum is 15%.",
    C1: "Largest single shareholder's percentage stake.",
    C3: "Combined stake of top 3 shareholders.",
    "Foreign %": "Percentage of reported shares held by foreign investors.",
    Stability: "Weighted holder mix score. High = more long-term holders (CP/ID), low = trading-oriented holders.",
};

const PRESETS = [
    { id: "critical", label: "🚨 Critical Float", desc: "Float < 5%", fn: s => s.ff < 5 },
    { id: "noforeign", label: "🌏 No Foreign", desc: "Zero foreign holders", fn: s => s.flags.includes("ZeroForeign") },
    { id: "insider", label: "🏢 Insider Controlled", desc: "Insider > 75%", fn: s => s.flags.includes("Insider>75%") },
    { id: "best", label: "✅ Best Governed", desc: "Green tier + HHI < 500", fn: s => s.tier === "Green" && s.hhi < 500 },
    { id: "foreign", label: "💱 Foreign Dominated", desc: "Foreign > 50%", fn: s => s.fr > 50 },
    { id: "red", label: "⚠️ Red Tier All", desc: "All red risk stocks", fn: s => s.tier === "Red" },
];

function Tooltip2({ children, text }) {
    const [show, setShow] = useState(false);
    return (
        <span className="relative inline-block">
            <span
                onMouseEnter={() => setShow(true)}
                onMouseLeave={() => setShow(false)}
                style={{ cursor: "help", color: "#6b8aad", fontSize: 11, marginLeft: 4 }}
            >ⓘ</span>
            {show && (
                <span style={{
                    position: "absolute", bottom: "120%", left: "50%", transform: "translateX(-50%)",
                    background: "#0d1e30", border: "1px solid #1e3a52", borderRadius: 6, padding: "6px 10px",
                    fontSize: 11, color: "#a8c8e8", whiteSpace: "nowrap", maxWidth: 260, lineHeight: 1.4,
                    zIndex: 100, boxShadow: "0 4px 20px rgba(0,0,0,0.6)"
                }}>{text}</span>
            )}
        </span>
    );
}

function FlagPill({ flag }) {
    const [show, setShow] = useState(false);
    const colors = {
        "Insider>75%": "#e76f51", "SingleCP>50%": "#e9843a", "LowFloat<15%": "#e9c46a",
        "CriticalFloat<5%": "#d62828", "ZeroForeign": "#6d6875"
    };
    return (
        <span
            onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}
            style={{
                position: "relative", display: "inline-block",
                background: (colors[flag] || "#444") + "22",
                border: `1px solid ${colors[flag] || "#444"}55`,
                color: colors[flag] || "#aaa", borderRadius: 4,
                fontSize: 9, padding: "1px 5px", margin: "1px", cursor: "default", lineHeight: 1.5
            }}
        >
            {flag}
            {show && FLAG_DEFS[flag] && (
                <span style={{
                    position: "absolute", bottom: "120%", left: 0,
                    background: "#0d1e30", border: "1px solid #1e3a52", borderRadius: 6, padding: "6px 10px",
                    fontSize: 11, color: "#a8c8e8", whiteSpace: "normal", width: 220, lineHeight: 1.5,
                    zIndex: 100, boxShadow: "0 4px 20px rgba(0,0,0,0.6)"
                }}>{FLAG_DEFS[flag]}</span>
            )}
        </span>
    );
}

function HeatCell({ value, min, max, reverse = false, fmt }) {
    const pct = max === min ? 0.5 : (value - min) / (max - min);
    const heat = reverse ? 1 - pct : pct;
    const r = Math.round(231 * heat);
    const g = Math.round(Math.max(158 - heat * 100, 60));
    const b = Math.round(81 + (1 - heat) * 90);
    return (
        <td style={{
            padding: "5px 8px", textAlign: "right", fontSize: 11, fontFamily: "monospace",
            color: `rgba(${r},${g},${b},0.95)`,
            background: `rgba(${r},${g},${b},0.08)`,
        }}>
            {fmt ? fmt(value) : value}
        </td>
    );
}

const API = "http://168.110.206.43:3000";

function StockDetail({ stock, onClose }) {
    if (!stock) return null;
    const [livePrice, setLivePrice] = useState(null);
    const [prices, setPrices] = useState([]);
    const [financials, setFinancials] = useState([]);
    const [profile, setProfile] = useState(null);
    const [loadingLive, setLoadingLive] = useState(true);

    useEffect(() => {
        setLivePrice(null); setPrices([]); setFinancials([]); setProfile(null); setLoadingLive(true);
        const t = stock.code;
        Promise.all([
            fetch(`${API}/api/stock/${t}/latest`).then(r => r.json()),
            fetch(`${API}/api/stock/${t}/prices?days=90`).then(r => r.json()),
            fetch(`${API}/api/stock/${t}/financials`).then(r => r.json()),
            fetch(`${API}/api/stock/${t}`).then(r => r.json()),
        ]).then(([lp, px, fin, prof]) => {
            setLivePrice(lp); setPrices(px); setFinancials(fin); setProfile(prof);
        }).catch(() => {}).finally(() => setLoadingLive(false));
    }, [stock.code]);

    const metrics = [
        { label: "HHI", val: stock.hhi.toFixed(0), max: 10000, color: HHI_COLOR[stock.hl] },
        { label: "Free Float", val: stock.ff.toFixed(1) + "%", max: 100, pct: stock.ff, color: stock.ff < 5 ? "#d62828" : stock.ff < 15 ? "#e9c46a" : "#2A9D8F" },
        { label: "C1 (Top holder)", val: stock.c1.toFixed(1) + "%", max: 100, pct: stock.c1, color: stock.c1 > 75 ? "#e76f51" : "#e9c46a" },
        { label: "C3 (Top 3)", val: stock.c3.toFixed(1) + "%", max: 100, pct: stock.c3, color: "#e9843a" },
        { label: "Foreign %", val: stock.fr.toFixed(1) + "%", max: 100, pct: stock.fr, color: "#457B9D" },
        { label: "ENS", val: stock.ens.toFixed(2), max: 50, pct: Math.min(stock.ens / 50, 1) * 100, color: "#2A9D8F" },
    ];

    return (
        <div style={{
            background: "#09131f", border: "1px solid #1e3a52", borderRadius: 10, padding: 20,
            minWidth: 280, maxWidth: 320, position: "sticky", top: 20
        }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                <div>
                    <div style={{ fontSize: 22, fontWeight: 700, color: "#e8f4f8", fontFamily: "monospace" }}>{stock.code}</div>
                    <div style={{ fontSize: 12, color: "#6b8aad", marginTop: 2, lineHeight: 1.3 }}>{stock.issuer}</div>
                </div>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    <span style={{
                        background: TIER_COLOR[stock.tier] + "33", border: `1px solid ${TIER_COLOR[stock.tier]}66`,
                        color: TIER_COLOR[stock.tier], borderRadius: 6, padding: "3px 10px", fontSize: 12, fontWeight: 700
                    }}>{stock.tier}</span>
                    <button onClick={onClose} style={{ background: "none", border: "none", color: "#6b8aad", cursor: "pointer", fontSize: 18, padding: 0 }}>×</button>
                </div>
            </div>

            {metrics.map(m => (
                <div key={m.label} style={{ marginBottom: 10 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                        <span style={{ fontSize: 11, color: "#6b8aad" }}>{m.label}</span>
                        <span style={{ fontSize: 11, color: m.color, fontFamily: "monospace", fontWeight: 600 }}>{m.val}</span>
                    </div>
                    <div style={{ background: "#132030", borderRadius: 3, height: 4 }}>
                        <div style={{ width: (m.pct !== undefined ? m.pct : Math.min(parseFloat(m.val) / m.max * 100, 100)) + "%", background: m.color, height: 4, borderRadius: 3, transition: "width 0.3s" }} />
                    </div>
                </div>
            ))}

            <div style={{ marginTop: 14, padding: "10px", background: "#060d18", borderRadius: 6 }}>
                <div style={{ fontSize: 10, color: "#6b8aad", marginBottom: 4 }}>TOP HOLDER</div>
                <div style={{ fontSize: 12, color: "#a8c8e8" }}>{stock.th || "—"}</div>
                <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
                    <span style={{ fontSize: 10, color: "#6b8aad", background: "#132030", borderRadius: 4, padding: "1px 6px" }}>{stock.tht}</span>
                    <span style={{ fontSize: 10, color: "#6b8aad" }}>{stock.hc} holder{stock.hc !== 1 ? "s" : ""} total</span>
                </div>
            </div>

            {stock.flags.length > 0 && (
                <div style={{ marginTop: 12 }}>
                    <div style={{ fontSize: 10, color: "#6b8aad", marginBottom: 5 }}>GOVERNANCE FLAGS</div>
                    <div>{stock.flags.map(f => <FlagPill key={f} flag={f} />)}</div>
                </div>
            )}

            {/* Live Price */}
            <div style={{ marginTop: 14, padding: 10, background: "#060d18", borderRadius: 6 }}>
                <div style={{ fontSize: 10, color: "#6b8aad", marginBottom: 4 }}>LIVE PRICE</div>
                {loadingLive ? (
                    <div style={{ fontSize: 11, color: "#6b8aad" }}>Loading...</div>
                ) : livePrice ? (
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: 18, fontWeight: 700, color: "#e8f4f8", fontFamily: "monospace" }}>
                            Rp {parseFloat(livePrice.price).toLocaleString("id-ID")}
                        </span>
                        <span style={{ fontSize: 13, fontWeight: 600, color: parseFloat(livePrice.change_pct) >= 0 ? "#2A9D8F" : "#E76F51", fontFamily: "monospace" }}>
                            {parseFloat(livePrice.change_pct) >= 0 ? "▲" : "▼"} {Math.abs(livePrice.change_pct)}%
                        </span>
                    </div>
                ) : <div style={{ fontSize: 11, color: "#6b8aad" }}>No price data</div>}
            </div>

            {/* Price Chart */}
            {prices.length > 0 && (
                <div style={{ marginTop: 12 }}>
                    <div style={{ fontSize: 10, color: "#6b8aad", marginBottom: 6 }}>PRICE (90 DAYS)</div>
                    <ResponsiveContainer width="100%" height={80}>
                        <BarChart data={prices} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                            <YAxis domain={["auto","auto"]} hide />
                            <Tooltip
                                contentStyle={{ background: "#09131f", border: "1px solid #1e3a52", fontSize: 10 }}
                                formatter={(v) => [`Rp ${parseFloat(v).toLocaleString("id-ID")}`, "Close"]}
                                labelFormatter={(l) => new Date(l).toLocaleDateString("id-ID")}
                            />
                            <Bar dataKey="close_price" fill="#457B9D" radius={[1,1,0,0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}

            {/* Profile */}
            {profile && (
                <div style={{ marginTop: 12, padding: 10, background: "#060d18", borderRadius: 6 }}>
                    <div style={{ fontSize: 10, color: "#6b8aad", marginBottom: 4 }}>COMPANY INFO</div>
                    {profile.sector && <div style={{ fontSize: 11, color: "#a8c8e8" }}>📊 {profile.sector}{profile.industry ? ` · ${profile.industry}` : ""}</div>}
                    {profile.website && <div style={{ fontSize: 11, marginTop: 3 }}><a href={profile.website} target="_blank" rel="noreferrer" style={{ color: "#457B9D" }}>🔗 {profile.website.replace("https://","").replace("http://","")}</a></div>}
                </div>
            )}

            {/* Financials */}
            {financials.length > 0 && (
                <div style={{ marginTop: 12 }}>
                    <div style={{ fontSize: 10, color: "#6b8aad", marginBottom: 6 }}>FINANCIALS</div>
                    <ResponsiveContainer width="100%" height={80}>
                        <BarChart data={[...financials].reverse()} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                            <YAxis hide />
                            <Tooltip
                                contentStyle={{ background: "#09131f", border: "1px solid #1e3a52", fontSize: 10 }}
                                formatter={(v, n) => [v ? `Rp ${(v/1e9).toFixed(1)}B` : "N/A", n]}
                            />
                            <Bar dataKey="revenue" name="Revenue" fill="#2A9D8F" radius={[1,1,0,0]} />
                            <Bar dataKey="net_income" name="Net Income" fill="#457B9D" radius={[1,1,0,0]} />
                        </BarChart>
                    </ResponsiveContainer>
                    <div style={{ fontSize: 10, color: "#6b8aad", marginTop: 4, textAlign: "center" }}>Revenue vs Net Income (in billions IDR)</div>
                </div>
            )}
        </div>
    );
}

const CustomScatterTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const d = payload[0]?.payload;
    if (!d) return null;
    return (
        <div style={{ background: "#09131f", border: "1px solid #1e3a52", borderRadius: 8, padding: "10px 14px", fontSize: 12 }}>
            <div style={{ fontWeight: 700, color: "#e8f4f8", fontFamily: "monospace", marginBottom: 4 }}>{d.code}</div>
            <div style={{ color: "#6b8aad" }}>{d.issuer?.substring(0, 30)}</div>
            <div style={{ color: TIER_COLOR[d.tier], marginTop: 4 }}>{d.tier} Risk</div>
            <div style={{ color: "#a8c8e8", marginTop: 2 }}>HHI: <span style={{ fontFamily: "monospace" }}>{d.hhi?.toFixed(0)}</span></div>
            <div style={{ color: "#a8c8e8" }}>Float: <span style={{ fontFamily: "monospace" }}>{d.ff?.toFixed(1)}%</span></div>
        </div>
    );
};

export default function App() {
    const [tierFilter, setTierFilter] = useState(null);
    const [hhiFilter, setHhiFilter] = useState(null);
    const [presetFilter, setPresetFilter] = useState(null);
    const [search, setSearch] = useState("");
    const [selectedStock, setSelectedStock] = useState(null);
    const [sortCol, setSortCol] = useState("hhi");
    const [sortDir, setSortDir] = useState("desc");
    const [activeTab, setActiveTab] = useState("overview");
    const [flagFilter, setFlagFilter] = useState(null);
    const [ownerTypeFilter, setOwnerTypeFilter] = useState("All");
    const [ownerSearch, setOwnerSearch] = useState("");
    const [expandedPortfolios, setExpandedPortfolios] = useState({});
    const [drawerOpen, setDrawerOpen] = useState(false);
    const drawerRef = useRef(null);

    useEffect(() => {
        if (!drawerOpen) return;
        const handleKey = (e) => { if (e.key === "Escape") setDrawerOpen(false); };
        const handleOutside = (e) => {
            if (drawerRef.current && !drawerRef.current.contains(e.target)) setDrawerOpen(false);
        };
        document.addEventListener("keydown", handleKey);
        document.addEventListener("mousedown", handleOutside);
        return () => {
            document.removeEventListener("keydown", handleKey);
            document.removeEventListener("mousedown", handleOutside);
        };
    }, [drawerOpen]);

    const filtered = useMemo(() => {
        let d = RAW;
        if (tierFilter) d = d.filter(s => s.tier === tierFilter);
        if (hhiFilter) d = d.filter(s => s.hl === hhiFilter);
        if (flagFilter) d = d.filter(s => s.flags.includes(flagFilter));
        if (presetFilter) {
            const preset = PRESETS.find(p => p.id === presetFilter);
            if (preset) d = d.filter(preset.fn);
        }
        if (ownerTypeFilter === "Individual") {
            d = d.filter(s => s.tht === "ID");
        } else if (ownerTypeFilter === "Company/Institution") {
            d = d.filter(s => s.tht !== "ID");
        }
        if (search) {
            const q = search.toLowerCase();
            d = d.filter(s => s.code.toLowerCase().includes(q) || s.issuer.toLowerCase().includes(q) || (s.th && s.th.toLowerCase().includes(q)));
        }
        return d;
    }, [tierFilter, hhiFilter, flagFilter, presetFilter, ownerTypeFilter, search]);

    const sorted = useMemo(() => {
        return [...filtered].sort((a, b) => {
            const av = a[sortCol], bv = b[sortCol];
            if (typeof av === "number") return sortDir === "asc" ? av - bv : bv - av;
            return sortDir === "asc" ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
        });
    }, [filtered, sortCol, sortDir]);

    const stats = useMemo(() => {
        const d = filtered;
        if (!d.length) return {};
        return {
            total: d.length,
            red: d.filter(s => s.tier === "Red").length,
            amber: d.filter(s => s.tier === "Amber").length,
            green: d.filter(s => s.tier === "Green").length,
            avgHHI: d.reduce((a, s) => a + s.hhi, 0) / d.length,
            avgFF: d.reduce((a, s) => a + s.ff, 0) / d.length,
            lowFloat: d.filter(s => s.ff < 15).length,
            highConc: d.filter(s => s.hl === "High").length,
        };
    }, [filtered]);

    const hhiHist = useMemo(() => {
        const bins = [
            { range: "0–500", min: 0, max: 500, Low: 0, Moderate: 0, High: 0 },
            { range: "500–1.5k", min: 500, max: 1500, Low: 0, Moderate: 0, High: 0 },
            { range: "1.5k–2.5k", min: 1500, max: 2500, Low: 0, Moderate: 0, High: 0 },
            { range: "2.5k–5k", min: 2500, max: 5000, Low: 0, Moderate: 0, High: 0 },
            { range: "5k–7.5k", min: 5000, max: 7500, Low: 0, Moderate: 0, High: 0 },
            { range: "7.5k+", min: 7500, max: Infinity, Low: 0, Moderate: 0, High: 0 },
        ];
        filtered.forEach(s => {
            const bin = bins.find(b => s.hhi >= b.min && s.hhi < b.max);
            if (bin) bin[s.hl] = (bin[s.hl] || 0) + 1;
        });
        return bins;
    }, [filtered]);

    const tierDist = useMemo(() => [
        { name: "Red", value: filtered.filter(s => s.tier === "Red").length, color: "#E76F51" },
        { name: "Amber", value: filtered.filter(s => s.tier === "Amber").length, color: "#E9C46A" },
        { name: "Green", value: filtered.filter(s => s.tier === "Green").length, color: "#2A9D8F" },
    ], [filtered]);

    const flagCounts = useMemo(() => {
        const flags = ["LowFloat<15%", "Insider>75%", "SingleCP>50%", "ZeroForeign", "CriticalFloat<5%"];
        return flags.map(f => ({ flag: f, count: filtered.filter(s => s.flags.includes(f)).length }))
            .sort((a, b) => b.count - a.count);
    }, [filtered]);

    const hhhiRange = useMemo(() => {
        const vals = filtered.map(s => s.hhi);
        return { min: Math.min(...vals), max: Math.max(...vals) };
    }, [filtered]);
    const ffRange = useMemo(() => {
        const vals = filtered.map(s => s.ff);
        return { min: Math.min(...vals), max: Math.max(...vals) };
    }, [filtered]);
    const frRange = useMemo(() => {
        const vals = filtered.map(s => s.fr);
        return { min: Math.min(...vals), max: Math.max(...vals) };
    }, [filtered]);

    const ownerStats = useMemo(() => {
        const grouped = {};
        filtered.forEach(s => {
            // If we have detailed owners config for this stock
            if (_OWNERS[s.code] && _OWNERS[s.code].length > 0) {
                _OWNERS[s.code].forEach(h => {
                    if (!grouped[h.n]) {
                        grouped[h.n] = { name: h.n, type: h.t, count: 0, stocks: [], totalPct: 0 };
                    }
                    grouped[h.n].count += 1;
                    grouped[h.n].stocks.push({ code: s.code, pct: h.p, qty: h.q });
                    grouped[h.n].totalPct += h.p;
                });
            } else if (s.th) {
                // Fallback to the original top holder property if completely missing in CSV
                if (!grouped[s.th]) {
                    grouped[s.th] = { name: s.th, type: s.tht, count: 0, stocks: [], totalPct: 0 };
                }
                grouped[s.th].count += 1;
                grouped[s.th].stocks.push({ code: s.code, pct: s.c1, qty: null });
                grouped[s.th].totalPct += s.c1;
            }
        });

        // Sort stocks within each portfolio by percentage
        Object.values(grouped).forEach(o => o.stocks.sort((a, b) => b.pct - a.pct));

        return Object.values(grouped).sort((a, b) => b.count - a.count);
    }, [filtered]);

    const filteredOwners = useMemo(() => {
        if (!ownerSearch.trim()) return ownerStats;
        const lowerSearch = ownerSearch.toLowerCase();
        return ownerStats.filter(o => o.name.toLowerCase().includes(lowerSearch));
    }, [ownerStats, ownerSearch]);

    const ownerTypeData = useMemo(() => {
        let id = 0, inst = 0;
        filteredOwners.forEach(o => {
            if (o.type === "ID") id++;
            else inst++;
        });
        return [
            { name: "Individual", value: id, color: "#2A9D8F" },
            { name: "Institution", value: inst, color: "#E9C46A" }
        ];
    }, [filteredOwners]);

    const topOwnersBarData = useMemo(() => {
        return filteredOwners.slice(0, 5).map(o => ({
            name: o.name.length > 15 ? o.name.substring(0, 15) + "..." : o.name,
            fullName: o.name,
            count: o.count
        }));
    }, [filteredOwners]);

    const toggleExpand = (name) => {
        setExpandedPortfolios(prev => ({ ...prev, [name]: !prev[name] }));
    };

    const clearFilters = () => { setTierFilter(null); setHhiFilter(null); setFlagFilter(null); setPresetFilter(null); setSearch(""); };
    const hasFilter = tierFilter || hhiFilter || flagFilter || presetFilter || search;

    const sort = (col) => { setSortCol(col); setSortDir(s => col === sortCol ? (s === "asc" ? "desc" : "asc") : "desc"); };
    const sortIcon = (col) => col === sortCol ? (sortDir === "asc" ? " ▲" : " ▼") : "";

    const dynamicTitle = useMemo(() => {
        if (presetFilter) return PRESETS.find(p => p.id === presetFilter)?.label + " — " + filtered.length + " stocks";
        if (tierFilter) return `${tierFilter} Risk: ${filtered.length} stocks of ${RAW.length}`;
        if (hhiFilter) return `${hhiFilter} HHI Concentration: ${filtered.length} stocks`;
        if (flagFilter) return `${flagFilter}: ${filtered.length} affected stocks`;
        return `IDX Governance Dashboard — ${RAW.length} stocks`;
    }, [filtered, tierFilter, hhiFilter, flagFilter, presetFilter]);

    const tableCols = [
        { key: "code", label: "Code", fixed: true },
        { key: "hhi", label: "HHI" },
        { key: "ff", label: "Float%" },
        { key: "c1", label: "C1%" },
        { key: "c3", label: "C3%" },
        { key: "th", label: "Owner" },
        { key: "tht", label: "Owner Type" },
        { key: "fr", label: "Foreign%" },
        { key: "ip", label: "Insider%" },
        { key: "ss", label: "Stability" },
    ];

    // NAV_TABS — shared by both the desktop tab bar and the mobile hamburger drawer.
    // "HHI" is an intentional abbreviation of "HHI Distribution" to keep labels compact.
    const NAV_TABS = [["overview", "Overview"], ["scatter", "Risk Map"], ["hhi", "HHI"], ["flags", "Flags"], ["table", "Screener"], ["owners", "Owners"]];

    return (
        <div className="app-root" style={{ background: "#060d18", minHeight: "100vh", color: "#e8f4f8", fontFamily: "'DM Sans', sans-serif", padding: "0 0 40px" }}>
            <style>{`
                /* ── Mobile-first responsive system ──────────────────────────── */
                /* Reference breakpoints (md=768px is the primary split point):   */
                /* xs: 320px | sm: 375px | md: 768px | lg: 1024px | xl: 1440px   */
                .app-root { overflow-x: hidden; }

                /* Header */
                .app-header { padding: clamp(12px, 4vw, 20px) clamp(12px, 4vw, 28px) 14px; }
                .header-row { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; }
                .header-title { font-size: clamp(0.875rem, 5vw, 1.375rem); margin: 0; font-weight: 700; color: #e8f4f8; }
                .header-eyebrow { font-size: clamp(0.625rem, 2.5vw, 0.6875rem); letter-spacing: 3px; color: #457B9D; font-family: "DM Mono", monospace; margin-bottom: 4px; }
                .header-right { display: flex; gap: 10px; align-items: center; }

                /* Search */
                .search-wrap { position: relative; display: flex; align-items: center; }
                .search-input { background: #0d1e30; border-radius: 20px; color: #e8f4f8; padding: 8px 34px 8px 32px; font-size: 0.75rem; outline: none; transition: border-color 0.2s; width: clamp(140px, 40vw, 260px); }

                /* Hamburger button — hidden on desktop, shown on mobile */
                .hamburger-btn {
                    display: none;
                    align-items: center; justify-content: center;
                    background: none; border: 1px solid #1e3a52;
                    color: #a8c8e8; border-radius: 6px;
                    width: 44px; height: 44px;
                    font-size: 1.25rem; cursor: pointer; flex-shrink: 0;
                }

                /* Tab nav — desktop horizontal row */
                .tab-nav-desktop {
                    display: flex; gap: 0;
                    border-bottom: 1px solid #132030;
                    padding-left: clamp(12px, 4vw, 28px);
                    background: #09131f;
                    overflow-x: auto;
                    -webkit-overflow-scrolling: touch;
                    scrollbar-width: none;
                }
                .tab-nav-desktop::-webkit-scrollbar { display: none; }

                /* Content area */
                .content-area { padding: clamp(12px, 4vw, 20px) clamp(12px, 4vw, 28px); }

                /* Overview two-column grid → single column on mobile */
                .overview-grid { display: grid; grid-template-columns: 1fr; gap: 16px; }

                /* Side-by-side layouts → stack on mobile */
                .scatter-layout { display: flex; flex-direction: column; gap: 16px; align-items: stretch; }
                .screener-layout { display: flex; flex-direction: column; gap: 16px; align-items: stretch; }

                /* Mobile drawer overlay */
                .drawer-overlay {
                    display: none;
                    position: fixed; inset: 0; z-index: 200;
                    background: rgba(0,0,0,0.6);
                }
                .drawer-overlay.open { display: block; }
                .mobile-drawer {
                    position: fixed; top: 0; left: 0; bottom: 0; z-index: 201;
                    width: min(280px, 85vw);
                    background: #0d1e30; border-right: 1px solid #1e3a52;
                    padding: 24px 0;
                    transform: translateX(-100%);
                    transition: transform 0.28s cubic-bezier(0.4,0,0.2,1);
                    display: flex; flex-direction: column;
                    overflow-y: auto;
                }
                .mobile-drawer.open { transform: translateX(0); }
                .drawer-close {
                    align-self: flex-end;
                    margin-right: 20px; margin-bottom: 16px;
                    background: none; border: 1px solid #1e3a52;
                    color: #a8c8e8; border-radius: 6px;
                    width: 44px; height: 44px;
                    font-size: 1.25rem; cursor: pointer;
                    display: flex; align-items: center; justify-content: center;
                }
                .drawer-nav-btn {
                    background: none; border: none; text-align: left;
                    padding: 14px 24px; font-size: 0.9375rem;
                    font-family: "DM Mono", monospace; letter-spacing: 0.5px;
                    cursor: pointer; transition: background 0.15s;
                    min-height: 52px; display: flex; align-items: center;
                    border-left: 3px solid transparent;
                }
                .drawer-nav-btn.active {
                    color: #a8d8ea;
                    background: #132030;
                    border-left-color: #457B9D;
                }
                .drawer-nav-btn:not(.active) { color: #6b8aad; }
                .drawer-nav-btn:hover:not(.active) { background: #09131f; }

                /* ── min-width (tablet and up) overrides ───────────────────── */
                @media (min-width: 768px) {
                    .overview-grid { grid-template-columns: 1fr 1fr; }
                    .scatter-layout { flex-direction: row; align-items: flex-start; }
                    .screener-layout { flex-direction: row; align-items: flex-start; }
                    .hamburger-btn { display: none !important; }
                    .tab-nav-desktop { overflow-x: visible; }
                }

                /* KPI cards — base rule; mobile override below forces 2 columns */
                .kpi-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1px; background: #132030; border-bottom: 1px solid #132030; }

                /* ── max-width mobile overrides (< 768px) ───────────────────── */
                @media (max-width: 767px) {
                    .hamburger-btn { display: flex; }
                    .tab-nav-desktop { display: none; }
                    .kpi-cards { grid-template-columns: repeat(2, 1fr); }
                }
            `}</style>
            <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;700&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet" />
            <OnboardingTour />

            {/* Mobile Nav Drawer */}
            <div className={`drawer-overlay${drawerOpen ? " open" : ""}`} aria-hidden="true" />
            <nav ref={drawerRef} className={`mobile-drawer${drawerOpen ? " open" : ""}`} aria-label="Mobile navigation">
                <button className="drawer-close" onClick={() => setDrawerOpen(false)} aria-label="Close navigation">✕</button>
                {NAV_TABS.map(([id, label]) => (
                    <button
                        key={id}
                        className={`drawer-nav-btn${activeTab === id ? " active" : ""}`}
                        onClick={() => { setActiveTab(id); setDrawerOpen(false); }}
                        aria-current={activeTab === id ? "page" : undefined}
                    >{label}</button>
                ))}
            </nav>

            {/* Header */}
            <div className="app-header" style={{ background: "linear-gradient(180deg, #0d1e30 0%, #09131f 100%)", borderBottom: "1px solid #132030" }}>
                <div className="header-row">
                    <div>
                        <div className="header-eyebrow">IDX · BURSA EFEK INDONESIA · 27 FEB 2026</div>
                        <h1 className="header-title">{dynamicTitle}</h1>
                    </div>
                    <div className="header-right">
                        {/* Global Search — top-right, always visible */}
                        <div data-tour="search" className="search-wrap">
                            <span aria-hidden="true" style={{ position: "absolute", left: 10, color: "#457B9D", fontSize: 13, pointerEvents: "none", userSelect: "none" }}>🔍</span>
                            <input
                                value={search}
                                onChange={e => { setSearch(e.target.value); if (e.target.value) setActiveTab("table"); }}
                                placeholder="Search stock, issuer, or owner…"
                                aria-label="Search stocks by code, issuer name, or top owner"
                                title="Search across all stocks by code, issuer name, or top owner"
                                className="search-input"
                                style={{
                                    border: `1px solid ${search ? "#457B9D" : "#1e3a52"}`,
                                }}
                                onFocus={e => { e.target.style.borderColor = "#457B9D"; e.target.style.boxShadow = "0 0 0 2px #457B9D33"; }}
                                onBlur={e => { e.target.style.borderColor = search ? "#457B9D" : "#1e3a52"; e.target.style.boxShadow = "none"; }}
                            />
                            {search && (
                                <button
                                    onClick={() => setSearch("")}
                                    title="Clear search"
                                    style={{
                                        position: "absolute", right: 10,
                                        background: "none", border: "none", color: "#6b8aad",
                                        cursor: "pointer", fontSize: 16, padding: 0, lineHeight: 1,
                                    }}
                                >×</button>
                            )}
                        </div>
                        {hasFilter && (
                            <button onClick={clearFilters} style={{
                                background: "#132030", border: "1px solid #e76f5155", color: "#e76f51",
                                borderRadius: 6, padding: "6px 14px", cursor: "pointer", fontSize: 12, whiteSpace: "nowrap"
                            }}>✕ Clear all filters</button>
                        )}
                        {/* Hamburger — visible only on mobile via CSS */}
                        <button
                            className="hamburger-btn"
                            onClick={() => setDrawerOpen(true)}
                            aria-label="Open navigation menu"
                            aria-expanded={drawerOpen}
                        >☰</button>
                    </div>
                </div>

                {/* Active filter pills */}
                {hasFilter && (
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 10 }}>
                        {tierFilter && <span style={{ background: TIER_COLOR[tierFilter] + "33", border: `1px solid ${TIER_COLOR[tierFilter]}`, borderRadius: 20, padding: "2px 10px", fontSize: 11, color: TIER_COLOR[tierFilter], cursor: "pointer" }} onClick={() => setTierFilter(null)}>Tier: {tierFilter} ×</span>}
                        {hhiFilter && <span style={{ background: "#e9c46a33", border: "1px solid #e9c46a", borderRadius: 20, padding: "2px 10px", fontSize: 11, color: "#e9c46a", cursor: "pointer" }} onClick={() => setHhiFilter(null)}>HHI: {hhiFilter} ×</span>}
                        {flagFilter && <span style={{ background: "#e76f5133", border: "1px solid #e76f51", borderRadius: 20, padding: "2px 10px", fontSize: 11, color: "#e76f51", cursor: "pointer" }} onClick={() => setFlagFilter(null)}>{flagFilter} ×</span>}
                        {presetFilter && <span style={{ background: "#457B9D33", border: "1px solid #457B9D", borderRadius: 20, padding: "2px 10px", fontSize: 11, color: "#457B9D", cursor: "pointer" }} onClick={() => setPresetFilter(null)}>{PRESETS.find(p => p.id === presetFilter)?.label} ×</span>}
                    </div>
                )}

                {/* Preset Screens */}
                <div data-tour="presets" style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
                    {PRESETS.map(p => (
                        <button key={p.id} onClick={() => setPresetFilter(presetFilter === p.id ? null : p.id)} style={{
                            background: presetFilter === p.id ? "#1e3a52" : "#0d1e30",
                            border: `1px solid ${presetFilter === p.id ? "#457B9D" : "#1e3a52"}`,
                            color: presetFilter === p.id ? "#a8d8ea" : "#6b8aad",
                            borderRadius: 6, padding: "5px 12px", cursor: "pointer", fontSize: 11,
                            transition: "all 0.15s"
                        }}>
                            {p.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* KPI Cards */}
            <div data-tour="kpi-cards" className="kpi-cards">
                {[
                    { label: "TOTAL STOCKS", val: stats.total, color: "#a8c8e8" },
                    { label: "🔴 RED RISK", val: stats.red, sub: `${stats.total ? Math.round(stats.red / stats.total * 100) : 0}% of total`, color: "#E76F51", click: () => setTierFilter(tierFilter === "Red" ? null : "Red") },
                    { label: "🟡 AMBER RISK", val: stats.amber, color: "#E9C46A", click: () => setTierFilter(tierFilter === "Amber" ? null : "Amber") },
                    { label: "🟢 GREEN RISK", val: stats.green, color: "#2A9D8F", click: () => setTierFilter(tierFilter === "Green" ? null : "Green") },
                    { label: "AVG HHI", val: stats.avgHHI?.toFixed(0), sub: "High conc. >2,500", color: stats.avgHHI > 2500 ? "#E76F51" : "#E9C46A" },
                    { label: "AVG FREE FLOAT", val: stats.avgFF?.toFixed(1) + "%", sub: "IDX min: 15%", color: stats.avgFF < 15 ? "#E76F51" : "#2A9D8F" },
                    { label: "FLOAT < 15%", val: stats.lowFloat, sub: `${stats.total ? Math.round(stats.lowFloat / stats.total * 100) : 0}% of filtered`, color: "#E9C46A" },
                    { label: "HIGH HHI", val: stats.highConc, sub: "HHI > 2,500", color: "#E76F51" },
                ].map(k => (
                    <div key={k.label} onClick={k.click} style={{
                        background: "#09131f", padding: "14px 18px", cursor: k.click ? "pointer" : "default",
                        borderRight: "1px solid #132030", transition: "background 0.15s",
                    }}
                        onMouseEnter={e => k.click && (e.currentTarget.style.background = "#0d1e30")}
                        onMouseLeave={e => k.click && (e.currentTarget.style.background = "#09131f")}
                    >
                        <div style={{ fontSize: 9, letterSpacing: 2, color: "#457B9D", marginBottom: 4 }}>{k.label}</div>
                        <div style={{ fontSize: 24, fontWeight: 700, fontFamily: "DM Mono, monospace", color: k.color }}>{k.val}</div>
                        {k.sub && <div style={{ fontSize: 10, color: "#6b8aad", marginTop: 2 }}>{k.sub}</div>}
                    </div>
                ))}
            </div>

            {/* Tab Nav */}
            <div className="tab-nav-desktop">
                {NAV_TABS.map(([id, label]) => (
                    <button key={id} onClick={() => setActiveTab(id)}
                        data-tour={id === "overview" ? "tab-overview" : id === "table" ? "tab-screener" : undefined}
                        style={{
                        background: "none", border: "none", borderBottom: activeTab === id ? "2px solid #457B9D" : "2px solid transparent",
                        color: activeTab === id ? "#a8d8ea" : "#6b8aad", padding: "12px 18px", cursor: "pointer",
                        fontSize: 12, fontFamily: "DM Mono, monospace", letterSpacing: 1, transition: "color 0.15s",
                        whiteSpace: "nowrap", minHeight: 44,
                    }}>{label}</button>
                ))}
            </div>

            <div className="content-area">

                {/* OVERVIEW TAB */}
                {activeTab === "overview" && (
                    <div className="overview-grid">
                        {/* Tier chart */}
                        <div style={{ background: "#09131f", border: "1px solid #132030", borderRadius: 10, padding: 20 }}>
                            <div style={{ fontSize: 11, color: "#6b8aad", letterSpacing: 2, marginBottom: 4 }}>RISK DISTRIBUTION</div>
                            <div style={{ fontSize: 14, color: "#e8f4f8", fontWeight: 600, marginBottom: 16 }}>
                                {stats.red > stats.green + stats.amber ? "Most Stocks Have Governance Concerns" : "Risk Spread Across Tiers"}
                            </div>
                            <ResponsiveContainer width="100%" height={220}>
                                <BarChart data={tierDist} onClick={d => d?.activePayload?.[0] && setTierFilter(tierFilter === d.activePayload[0].payload.name ? null : d.activePayload[0].payload.name)}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#132030" />
                                    <XAxis dataKey="name" tick={{ fill: "#6b8aad", fontSize: 11 }} />
                                    <YAxis tick={{ fill: "#6b8aad", fontSize: 11 }} />
                                    <Tooltip contentStyle={{ background: "#09131f", border: "1px solid #1e3a52", borderRadius: 6 }} labelStyle={{ color: "#e8f4f8" }} />
                                    <Bar dataKey="value" radius={[4, 4, 0, 0]} cursor="pointer">
                                        {tierDist.map(d => <Cell key={d.name} fill={d.color} />)}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                            <div style={{ fontSize: 10, color: "#457B9D", marginTop: 8 }}>↑ Click bars to filter</div>
                        </div>

                        {/* HHI Overview */}
                        <div style={{ background: "#09131f", border: "1px solid #132030", borderRadius: 10, padding: 20 }}>
                            <div style={{ fontSize: 11, color: "#6b8aad", letterSpacing: 2, marginBottom: 4 }}>HHI CONCENTRATION<Tooltip2 text={METRIC_DEFS.HHI} /></div>
                            <div style={{ fontSize: 14, color: "#e8f4f8", fontWeight: 600, marginBottom: 16 }}>
                                {stats.highConc > (stats.total / 2) ? `${Math.round(stats.highConc / stats.total * 100)}% of Stocks Are Highly Concentrated` : "Concentration Is Spread Across Zones"}
                            </div>
                            <ResponsiveContainer width="100%" height={220}>
                                <BarChart data={hhiHist} onClick={d => { if (d?.activePayload) { const hl = d.activePayload[0]?.payload; if (hl) setHhiFilter(hhiFilter === "High" ? null : "High"); } }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#132030" />
                                    <XAxis dataKey="range" tick={{ fill: "#6b8aad", fontSize: 9 }} />
                                    <YAxis tick={{ fill: "#6b8aad", fontSize: 11 }} />
                                    <Tooltip contentStyle={{ background: "#09131f", border: "1px solid #1e3a52", borderRadius: 6 }} labelStyle={{ color: "#e8f4f8" }} />
                                    <Bar dataKey="Low" stackId="a" fill="#2A9D8F" />
                                    <Bar dataKey="Moderate" stackId="a" fill="#E9C46A" />
                                    <Bar dataKey="High" stackId="a" fill="#E76F51" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                            <div style={{ fontSize: 10, color: "#457B9D", marginTop: 8 }}>↑ Stacked by HHI zone</div>
                        </div>

                        {/* Findings */}
                        <div style={{ background: "#09131f", border: "1px solid #132030", borderRadius: 10, padding: 20, gridColumn: "1 / -1" }}>
                            <div style={{ fontSize: 11, color: "#6b8aad", letterSpacing: 2, marginBottom: 12 }}>KEY FINDINGS</div>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
                                {[
                                    { icon: "⚠️", stat: `${RAW.filter(s => s.tier === "Red").length} stocks`, desc: "classified as Red risk (49%)" },
                                    { icon: "📉", stat: "15.9% avg float", desc: "barely above IDX 15% guideline" },
                                    { icon: "🏢", stat: "568 stocks", desc: "have float below IDX minimum" },
                                    { icon: "📊", stat: "HHI avg 3,609", desc: "deep into 'High concentration' zone" },
                                    { icon: "🌏", stat: "387 stocks", desc: "have zero foreign investor presence" },
                                    { icon: "🔍", stat: "408 stocks", desc: "controlled by a single corporate entity >50%" },
                                ].map(f => (
                                    <div key={f.stat} style={{ background: "#060d18", borderRadius: 8, padding: "12px 14px", borderLeft: "3px solid #1e3a52" }}>
                                        <div style={{ fontSize: 20, marginBottom: 4 }}>{f.icon}</div>
                                        <div style={{ fontSize: 16, fontWeight: 700, color: "#e8f4f8", fontFamily: "DM Mono, monospace" }}>{f.stat}</div>
                                        <div style={{ fontSize: 11, color: "#6b8aad", marginTop: 2 }}>{f.desc}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* RISK MAP TAB */}
                {activeTab === "scatter" && (
                    <div className="scatter-layout">
                        <div style={{ flex: 1, background: "#09131f", border: "1px solid #132030", borderRadius: 10, padding: 20 }}>
                            <div style={{ fontSize: 11, color: "#6b8aad", letterSpacing: 2, marginBottom: 4 }}>GOVERNANCE RISK MAP</div>
                            <div style={{ fontSize: 14, color: "#e8f4f8", fontWeight: 600, marginBottom: 4 }}>
                                Free Float % vs. HHI Concentration — Click a dot to inspect
                            </div>
                            <div style={{ fontSize: 11, color: "#6b8aad", marginBottom: 16 }}>
                                Reference lines: HHI 2,500 (high concentration threshold) · Float 15% (IDX guideline)
                            </div>
                            <ResponsiveContainer width="100%" height={500}>
                                <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#132030" />
                                    <XAxis dataKey="ff" name="Free Float %" type="number" domain={[0, 100]} tick={{ fill: "#6b8aad", fontSize: 10 }} label={{ value: "Free Float %", position: "insideBottom", offset: -10, fill: "#6b8aad", fontSize: 11 }} />
                                    <YAxis dataKey="hhi" name="HHI" type="number" domain={[0, 10000]} tick={{ fill: "#6b8aad", fontSize: 10 }} label={{ value: "HHI", angle: -90, position: "insideLeft", fill: "#6b8aad", fontSize: 11 }} />
                                    <Tooltip content={<CustomScatterTooltip />} />
                                    <ReferenceLine y={2500} stroke="#e9c46a" strokeDasharray="4 4" label={{ value: "HHI 2,500", fill: "#e9c46a", fontSize: 9 }} />
                                    <ReferenceLine x={15} stroke="#457B9D" strokeDasharray="4 4" label={{ value: "15%", fill: "#457B9D", fontSize: 9 }} />
                                    {["Red", "Amber", "Green"].map(tier => (
                                        <Scatter
                                            key={tier}
                                            name={tier}
                                            data={filtered.filter(s => s.tier === tier)}
                                            fill={TIER_COLOR[tier]}
                                            fillOpacity={0.7}
                                            onClick={d => setSelectedStock(selectedStock?.code === d.code ? null : d)}
                                            cursor="pointer"
                                        />
                                    ))}
                                </ScatterChart>
                            </ResponsiveContainer>
                            <div style={{ display: "flex", gap: 16, marginTop: 10 }}>
                                {["Red", "Amber", "Green"].map(t => (
                                    <span key={t} style={{ fontSize: 11, color: TIER_COLOR[t], cursor: "pointer" }}
                                        onClick={() => setTierFilter(tierFilter === t ? null : t)}>
                                        ● {t} ({filtered.filter(s => s.tier === t).length})
                                    </span>
                                ))}
                            </div>
                        </div>
                        {selectedStock && <StockDetail stock={selectedStock} onClose={() => setSelectedStock(null)} />}
                    </div>
                )}

                {/* HHI HISTOGRAM TAB */}
                {activeTab === "hhi" && (
                    <div style={{ background: "#09131f", border: "1px solid #132030", borderRadius: 10, padding: 20 }}>
                        <div style={{ fontSize: 11, color: "#6b8aad", letterSpacing: 2, marginBottom: 4 }}>HHI DISTRIBUTION<Tooltip2 text={METRIC_DEFS.HHI} /></div>
                        <div style={{ fontSize: 14, color: "#e8f4f8", fontWeight: 600, marginBottom: 16 }}>
                            {stats.highConc > (stats.total / 2) ? `${Math.round((stats.highConc || 0) / (stats.total || 1) * 100)}% of Filtered Stocks Are Highly Concentrated (HHI > 2,500)` : "HHI Distribution of Filtered Stocks"}
                        </div>
                        <ResponsiveContainer width="100%" height={380}>
                            <BarChart data={hhiHist}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#132030" />
                                <XAxis dataKey="range" tick={{ fill: "#6b8aad", fontSize: 11 }} />
                                <YAxis tick={{ fill: "#6b8aad", fontSize: 11 }} />
                                <Tooltip contentStyle={{ background: "#09131f", border: "1px solid #1e3a52", borderRadius: 6 }} labelStyle={{ color: "#e8f4f8" }} />
                                <Legend wrapperStyle={{ color: "#6b8aad", fontSize: 11 }} />
                                <Bar dataKey="Low" stackId="a" fill="#2A9D8F" name="Low HHI (<1,500)" />
                                <Bar dataKey="Moderate" stackId="a" fill="#E9C46A" name="Moderate HHI (1,500–2,500)" />
                                <Bar dataKey="High" stackId="a" fill="#E76F51" name="High HHI (>2,500)" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                        <div style={{ display: "flex", gap: 20, marginTop: 20, flexWrap: "wrap" }}>
                            {["Low", "Moderate", "High"].map(hl => {
                                const cnt = filtered.filter(s => s.hl === hl).length;
                                return (
                                    <div key={hl} onClick={() => setHhiFilter(hhiFilter === hl ? null : hl)} style={{
                                        background: "#060d18", border: `1px solid ${HHI_COLOR[hl]}55`, borderRadius: 8,
                                        padding: "12px 18px", cursor: "pointer", minWidth: 120
                                    }}>
                                        <div style={{ fontSize: 10, color: "#6b8aad", marginBottom: 4 }}>{hl.toUpperCase()} HHI</div>
                                        <div style={{ fontSize: 28, fontWeight: 700, color: HHI_COLOR[hl], fontFamily: "DM Mono, monospace" }}>{cnt}</div>
                                        <div style={{ fontSize: 10, color: "#6b8aad" }}>{stats.total ? Math.round(cnt / stats.total * 100) : 0}% of filtered</div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* FLAGS TAB */}
                {activeTab === "flags" && (
                    <div style={{ background: "#09131f", border: "1px solid #132030", borderRadius: 10, padding: 20 }}>
                        <div style={{ fontSize: 11, color: "#6b8aad", letterSpacing: 2, marginBottom: 4 }}>GOVERNANCE FLAGS</div>
                        <div style={{ fontSize: 14, color: "#e8f4f8", fontWeight: 600, marginBottom: 16 }}>
                            {flagCounts[0] ? `"${flagCounts[0].flag}" Affects ${flagCounts[0].count} of ${stats.total} Filtered Stocks` : "Flag Distribution"}
                        </div>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={flagCounts} layout="vertical" onClick={d => d?.activePayload?.[0] && setFlagFilter(flagFilter === d.activePayload[0].payload.flag ? null : d.activePayload[0].payload.flag)}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#132030" />
                                <XAxis type="number" tick={{ fill: "#6b8aad", fontSize: 10 }} />
                                <YAxis type="category" dataKey="flag" width={140} tick={{ fill: "#a8c8e8", fontSize: 10 }} />
                                <Tooltip contentStyle={{ background: "#09131f", border: "1px solid #1e3a52", borderRadius: 6 }} labelStyle={{ color: "#e8f4f8" }} />
                                <Bar dataKey="count" radius={[0, 4, 4, 0]} cursor="pointer">
                                    {flagCounts.map((f, i) => <Cell key={f.flag} fill={["#d62828", "#e76f51", "#e9843a", "#e9c46a", "#6d6875"][i]} />)}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                        <div style={{ fontSize: 10, color: "#457B9D", marginTop: 8 }}>↑ Click bars to filter stocks by flag</div>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12, marginTop: 20 }}>
                            {Object.entries(FLAG_DEFS).map(([flag, def]) => (
                                <div key={flag} onClick={() => setFlagFilter(flagFilter === flag ? null : flag)} style={{
                                    background: "#060d18", border: `1px solid ${flagFilter === flag ? "#457B9D" : "#1e3a52"}`,
                                    borderRadius: 8, padding: "12px 14px", cursor: "pointer"
                                }}>
                                    <div style={{ fontSize: 12, color: "#e8f4f8", fontWeight: 600, marginBottom: 4 }}>{flag}</div>
                                    <div style={{ fontSize: 10, color: "#6b8aad", lineHeight: 1.4 }}>{def}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* SCREENER TABLE TAB */}
                {activeTab === "table" && (
                    <div className="screener-layout">
                        <div style={{ flex: 1 }}>
                            <div style={{ background: "#09131f", border: "1px solid #132030", borderRadius: 10, padding: 20 }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                                    <div>
                                        <div style={{ fontSize: 11, color: "#6b8aad", letterSpacing: 2, marginBottom: 2 }}>STOCK SCREENER</div>
                                        <div style={{ fontSize: 13, color: "#e8f4f8" }}>{sorted.length} stocks — cells colour-coded by value</div>
                                    </div>
                                    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                                        <select
                                            value={ownerTypeFilter}
                                            onChange={e => setOwnerTypeFilter(e.target.value)}
                                            style={{
                                                background: "#060d18", border: "1px solid #1e3a52", borderRadius: 6,
                                                color: "#e8f4f8", padding: "7px 12px", fontSize: 12, outline: "none"
                                            }}
                                        >
                                            <option value="All">All Owners</option>
                                            <option value="Company/Institution">Company/Institution</option>
                                            <option value="Individual">Individual</option>
                                        </select>
                                        {search && (
                                            <span aria-label={`Active search: ${search}`} style={{ fontSize: 11, color: "#457B9D", fontFamily: "DM Mono, monospace" }}>
                                                <span aria-hidden="true">🔍</span> &ldquo;{search}&rdquo;
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div style={{ overflowX: "auto" }}>
                                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
                                        <thead>
                                            <tr style={{ borderBottom: "2px solid #132030" }}>
                                                <th style={{ textAlign: "left", padding: "8px", color: "#457B9D", cursor: "pointer", fontFamily: "DM Mono, monospace", fontSize: 10 }} onClick={() => sort("code")}>CODE{sortIcon("code")}</th>
                                                <th style={{ textAlign: "left", padding: "8px", color: "#457B9D", fontSize: 10 }}>ISSUER</th>
                                                <th style={{ textAlign: "left", padding: "8px", color: "#457B9D", fontSize: 10 }}>TIER</th>
                                                {tableCols.slice(1).map(c => (
                                                    <th key={c.key} style={{ textAlign: "right", padding: "8px", color: "#457B9D", cursor: "pointer", fontFamily: "DM Mono, monospace", fontSize: 10, whiteSpace: "nowrap" }} onClick={() => sort(c.key)}>
                                                        {c.label}{sortIcon(c.key)}
                                                    </th>
                                                ))}
                                                <th style={{ textAlign: "left", padding: "8px", color: "#457B9D", fontSize: 10 }}>FLAGS</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {sorted.slice(0, 200).map((s, i) => (
                                                <tr key={s.code}
                                                    onClick={() => setSelectedStock(selectedStock?.code === s.code ? null : s)}
                                                    style={{
                                                        borderBottom: "1px solid #0d1e30",
                                                        background: selectedStock?.code === s.code ? "#132030" : i % 2 === 0 ? "#09131f" : "#060d18",
                                                        cursor: "pointer", transition: "background 0.1s"
                                                    }}
                                                    onMouseEnter={e => selectedStock?.code !== s.code && (e.currentTarget.style.background = "#0d1e30")}
                                                    onMouseLeave={e => selectedStock?.code !== s.code && (e.currentTarget.style.background = i % 2 === 0 ? "#09131f" : "#060d18")}
                                                >
                                                    <td style={{ padding: "6px 8px", color: "#e8f4f8", fontFamily: "DM Mono, monospace", fontWeight: 600, fontSize: 11, whiteSpace: "nowrap" }}>{s.code}</td>
                                                    <td style={{ padding: "6px 8px", color: "#6b8aad", maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.issuer}</td>
                                                    <td style={{ padding: "6px 8px" }}>
                                                        <span style={{ color: TIER_COLOR[s.tier], fontSize: 10, fontWeight: 700 }}>{s.tier}</span>
                                                    </td>
                                                    <HeatCell value={s.hhi} min={hhhiRange.min} max={hhhiRange.max} fmt={v => v.toFixed(0)} />
                                                    <HeatCell value={s.ff} min={ffRange.min} max={ffRange.max} reverse fmt={v => v.toFixed(1) + "%"} />
                                                    <HeatCell value={s.c1} min={0} max={100} fmt={v => v.toFixed(1) + "%"} />
                                                    <HeatCell value={s.c3} min={0} max={100} fmt={v => v.toFixed(1) + "%"} />
                                                    <td style={{ padding: "6px 8px", color: "#6b8aad", maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={s.th}>{s.th || "—"}</td>
                                                    <td style={{ padding: "6px 8px" }}>
                                                        <span style={{
                                                            background: s.tht === "ID" ? "#2A9D8F22" : "#E9C46A22",
                                                            color: s.tht === "ID" ? "#2A9D8F" : "#E9C46A",
                                                            border: `1px solid ${s.tht === "ID" ? "#2A9D8F55" : "#E9C46A55"}`,
                                                            borderRadius: 4, padding: "2px 6px", fontSize: 9
                                                        }}>
                                                            {s.tht === "ID" ? "Individual" : "Company"}
                                                        </span>
                                                    </td>
                                                    <HeatCell value={s.fr} min={frRange.min} max={frRange.max} reverse fmt={v => v.toFixed(1) + "%"} />
                                                    <HeatCell value={s.ip} min={0} max={100} fmt={v => v.toFixed(1) + "%"} />
                                                    <HeatCell value={s.ss} min={0} max={100} fmt={v => v.toFixed(0)} />
                                                    <td style={{ padding: "6px 8px", minWidth: 160 }}>
                                                        {s.flags.map(f => <FlagPill key={f} flag={f} />)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    {sorted.length > 200 && <div style={{ color: "#6b8aad", fontSize: 11, padding: "10px", textAlign: "center" }}>Showing 200 of {sorted.length} — use filters to narrow down</div>}
                                </div>
                            </div>
                        </div>
                        {selectedStock && <div style={{ position: "sticky", top: 20 }}><StockDetail stock={selectedStock} onClose={() => setSelectedStock(null)} /></div>}
                    </div>
                )}

                {/* OWNERS TAB */}
                {activeTab === "owners" && (
                    <div style={{ background: "#09131f", border: "1px solid #132030", borderRadius: 10, padding: 20 }}>
                        <div style={{ fontSize: 11, color: "#6b8aad", letterSpacing: 2, marginBottom: 4 }}>TOP HOLDERS DISSECTION</div>
                        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 16, gap: 10 }}>
                            <div style={{ fontSize: 14, color: "#e8f4f8", fontWeight: 600 }}>
                                {filteredOwners.length} Unique Owners Found
                            </div>
                            <input
                                type="text"
                                placeholder="Search owner name..."
                                value={ownerSearch}
                                onChange={e => setOwnerSearch(e.target.value)}
                                style={{ background: "#060d18", border: "1px solid #1e3a52", borderRadius: 6, padding: "8px 12px", color: "#e8f4f8", fontSize: 12, outline: "none", width: 200 }}
                            />
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20, marginBottom: 20 }}>
                            <div style={{ background: "#060d18", border: "1px solid #132030", borderRadius: 8, padding: 16, display: "flex", flexDirection: "column", alignItems: "center" }}>
                                <div style={{ fontSize: 11, color: "#6b8aad", letterSpacing: 1, marginBottom: 8, alignSelf: "flex-start" }}>OWNER COMPOSITION</div>
                                <ResponsiveContainer width="100%" height={160}>
                                    <PieChart cursor="pointer">
                                        <Pie data={ownerTypeData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={40} outerRadius={60} stroke="none">
                                            {ownerTypeData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                                        </Pie>
                                        <Tooltip contentStyle={{ background: "#09131f", border: "1px solid #1e3a52", borderRadius: 6, fontSize: 12 }} itemStyle={{ color: "#e8f4f8" }} />
                                        <Legend iconType="circle" wrapperStyle={{ fontSize: 11, color: "#a8c8e8" }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div style={{ background: "#060d18", border: "1px solid #132030", borderRadius: 8, padding: 16 }}>
                                <div style={{ fontSize: 11, color: "#6b8aad", letterSpacing: 1, marginBottom: 8 }}>LARGEST HOLDING ENTITIES</div>
                                <ResponsiveContainer width="100%" height={160}>
                                    <BarChart data={topOwnersBarData} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#132030" horizontal={false} />
                                        <XAxis type="number" tick={{ fill: "#6b8aad", fontSize: 9 }} />
                                        <YAxis dataKey="name" type="category" width={110} tick={{ fill: "#a8c8e8", fontSize: 10 }} />
                                        <Tooltip contentStyle={{ background: "#09131f", border: "1px solid #1e3a52", borderRadius: 6, fontSize: 12 }} labelStyle={{ color: "#e8f4f8" }} cursor={{ fill: "#132030" }} />
                                        <Bar dataKey="count" fill="#2A9D8F" radius={[0, 4, 4, 0]} name="Stocks Held" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div style={{ overflowX: "auto" }}>
                            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
                                <thead>
                                    <tr style={{ borderBottom: "2px solid #132030" }}>
                                        <th style={{ textAlign: "left", padding: "10px 8px", color: "#457B9D", fontSize: 10, width: "30%" }}>OWNER NAME</th>
                                        <th style={{ textAlign: "left", padding: "10px 8px", color: "#457B9D", fontSize: 10, width: "12%" }}>TYPE</th>
                                        <th style={{ textAlign: "right", padding: "10px 8px", color: "#457B9D", fontSize: 10, width: "10%" }}>STOCKS</th>
                                        <th style={{ textAlign: "right", padding: "10px 8px", color: "#457B9D", fontSize: 10, width: "12%" }}>∑ EST. RISK WT</th>
                                        <th style={{ textAlign: "left", padding: "10px 16px", color: "#457B9D", fontSize: 10, width: "36%" }}>PORTFOLIO EXPOSURE</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredOwners.map((o, i) => {
                                        const isExpanded = expandedPortfolios[o.name];
                                        const visibleStocks = isExpanded ? o.stocks : o.stocks.slice(0, 5);
                                        const hiddenCount = o.stocks.length - 5;
                                        return (
                                            <tr key={o.name} style={{
                                                borderBottom: "1px solid #132030",
                                                background: i % 2 === 0 ? "#09131f" : "#060d18"
                                            }}>
                                                <td style={{ padding: "14px 8px", color: "#e8f4f8", fontWeight: 600, maxWidth: 240, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={o.name}>{o.name}</td>
                                                <td style={{ padding: "14px 8px" }}>
                                                    <span style={{
                                                        background: o.type === "ID" ? "#2A9D8F22" : "#E9C46A22",
                                                        color: o.type === "ID" ? "#2A9D8F" : "#E9C46A",
                                                        border: `1px solid ${o.type === "ID" ? "#2A9D8F55" : "#E9C46A55"}`,
                                                        borderRadius: 4, padding: "3px 8px", fontSize: 9, fontWeight: 500
                                                    }}>
                                                        {o.type === "ID" ? "Individual" : "Company"}
                                                    </span>
                                                </td>
                                                <td style={{ padding: "14px 8px", textAlign: "right", color: "#a8c8e8", fontFamily: "DM Mono, monospace", fontSize: 14 }}>
                                                    {o.count}
                                                </td>
                                                <td style={{ padding: "14px 8px", textAlign: "right", color: o.totalPct > 100 ? "#e76f51" : "#E9C46A", fontFamily: "DM Mono, monospace", fontSize: 13, fontWeight: 600 }}>
                                                    {o.totalPct.toFixed(1)}%
                                                </td>
                                                <td style={{ padding: "10px 16px" }}>
                                                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
                                                        {visibleStocks.map(sym => (
                                                            <span key={sym.code} style={{
                                                                background: "#132030", color: "#e8f4f8",
                                                                borderRadius: 4, padding: "3px 8px", fontSize: 10, fontFamily: "DM Mono, monospace",
                                                                border: "1px solid #1e3a52", display: "flex", alignItems: "center", gap: 6
                                                            }}>
                                                                <b style={{ color: "#a8c8e8" }}>{sym.code}</b>
                                                                <span style={{ color: sym.pct > 50 ? "#e76f51" : sym.pct > 25 ? "#E9C46A" : "#2A9D8F" }}>{sym.pct.toFixed(2)}%</span>
                                                            </span>
                                                        ))}
                                                        {!isExpanded && hiddenCount > 0 && (
                                                            <button onClick={() => toggleExpand(o.name)} style={{ background: "#2A9D8F22", color: "#2A9D8F", border: "1px dashed #2A9D8F55", borderRadius: 4, padding: "3px 8px", fontSize: 10, cursor: "pointer", fontWeight: 600 }}>+{hiddenCount} More</button>
                                                        )}
                                                        {isExpanded && hiddenCount > 0 && (
                                                            <button onClick={() => toggleExpand(o.name)} style={{ background: "transparent", color: "#e76f51", border: "none", padding: "3px 8px", fontSize: 10, cursor: "pointer", textDecoration: "underline", fontWeight: 600 }}>Show Less</button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
            <SpeedInsights />
        </div>
    );
}
