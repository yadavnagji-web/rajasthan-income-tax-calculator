# Script to parse the user's CSV data and compare calculations
csv_text = """
,MASTER DATA,,,,,,L-1
,lHkh ihys lsy vo'; HkjsaA,,,,,,L-2
,dk;kZy; dk uke %,Govt.Praveshika Sanskrit School kunwa,,,,,L-3
,dk;kZy; dk TAN %,JDHG20338D, DDO dk uke %,JEEVRAJ PARMAR,,,L-4
,dkfeZd dk uke %,Nagji Yadav,dkfeZd dk in %,TEACHER,,,L-5
, is ysoy %,L-11,lsok dk uke ¼dSMj@laoxZ½ %,Subordinate,,,L-6
,dkfeZd dk PAN %,AHHPY4147Q,cSad [kkrk la[;k %,15000100003153,,,L-7
,SI Number :,,GPF No :,,,GIS,L-8
,jkT; chek ekfld dVkSrh %,5000,Mobile No :,9982151938,,0,L-9
,ekpZ 2024 dk ewy osru %,47900,Current Rate of HRA : ,0.1,,700,L-10
,"D;k vkius fofÙk; o""kZ 2024&25 esa lefZiZr fy;k gS \",NO,lefZiZr fcy cukus dk ekg %,,,1400,L-11
,LIC Premium Deduction From Salary ?,,lewg nq?kZVuk chek izhfe;e %,700,,2100,L-12
,D;k vkidks cksul feyk gS \,YES,fgrdkjh fuf/k dVkSfr djuh gS %,,,,L-13
,"D;k vki ofj""B ukxfjd ¼60&80 vk;qoxZ½ esa vkrs gS \",NO,'kgjh {kfriwfrZ HkÙkk (CCA) :,NA,,,L-14
"""
print("Parsing master fields...")
