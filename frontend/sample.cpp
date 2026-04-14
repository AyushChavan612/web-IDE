#include<bits/stdc++.h>
using namespace std;

vector<array<int,2>> node;

void insert(int num){
   int curr=0;
   for(int i = 30; i >= 0; --i){
       int bit = ((num >> i) & 1);
       if(node[curr][bit]==-1){
	   int no = node.size();
           node[curr][bit] = no;
	   node.push_back({-1,-1});
       }
       curr = node[curr][bit];
   }
}

int findMaxValue(int num){
   int curr=0,val=0;
   for(int i = 30; i >= 0; --i){
      int bit = !((num >> i) & 1);
      if(node[curr][bit]!=-1){
          val = val | (1 << i);
	  curr = node[curr][bit];
      } else {
          curr = node[curr][!bit];
      }
   }
   return val;
}


int main(){
   int n;
   cin >> n;
   int ans=0,Xor=0;
   vector<int> xors;
   node.push_back({-1,-1});
   for(int i = 0; i < n; ++i){
        int x;
	cin >> x;
	Xor ^= x;
	xors.push_back(Xor);
	ans = max(ans , Xor);
	insert(Xor);
   }

   for(auto & num : xors){
       ans = max(ans , findMaxValue(num)); 
   }

   cout << ans << endl;
}

/*
input text :
4
5 1 5 9
#include<iostream>
using namespace std;

int main(){
    for(int i = 0; i < 10000; ++i)
    cout << i << " " << "hello world\n";
}
*/