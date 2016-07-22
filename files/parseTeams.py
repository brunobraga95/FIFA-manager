"""
parse FIFA teams
"""
import sys
import os

with open('fifa15-16teams') as f:
    lines = f.readlines()
res = []
teams = []
divisionName = '\''
for i in lines:
	if i[0] == '[':
		if divisionName!='\'':
			res.append(teams)
		teams = []
		divisionName = '\''
		for j in i:
			if j!='[' and j!=']':
				divisionName = divisionName+j
			else:
				if j==']':	 
					divisionName = divisionName+' '
		divisionName = divisionName[:-1]
		divisionName = divisionName+'\''
		teams.append(divisionName)
	else:
		time = '\''+i
		tam = len(time)
		if time[tam-1] == '\n':
			time = time[:-1]
		time = time+'\''
		teams.append(time)
res.append(teams)
string = '[['
for x in res:
	for j in x:
		string = string + j + ','
	string = string[:-1]
	string = string+'],['
string = string[:-2]
string = string + ']'
print string
