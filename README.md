### How to run

- Unzip
- "npm install"
- "npm run dev"

### Notes

- **Don't use Realtime DB!!** Ideally move to Firestore whenever you can.
- Any changes to your DB will automatically be reflected in the grid. And vice versa.
- "type of food" is not a correct property name, use camelCase instead (typeOfFood). Same thing for "Num of score"
- Right now the rating is calculated with a weighted average of likes and dislikes to a total of 5. I wasn't sure whether you wanted to store that value in the DB though. I think the field you intended for this was "Num of score"? Not sure. But if that's what you want, just let me know and I'll apply that fix.
- Since we don't require users to be authenticated to vote, and to prevent the same user from voting multiple times (by just refreshing the page and voting again), I am storing the data in localStorage. Meaning that unless they change browsers, open in incognito, or clear their cache, their vote will still be there. This is our best approach short of focing users to authenticate.
- Ag-Grid (that's the table I'm using) is extraordinarily performant even with millions of items of data. So it's a good choice for this kind of data.
- Depending on your browser's theme, the grid will either be black or white.

If you have any questions, please feel free!
