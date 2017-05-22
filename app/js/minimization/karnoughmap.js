








/*// for a good javascript reference, see http://wp.netscape.com/eng/mozilla/3.0/handbook/javascript/

// Constants
var MaxVariableCount=4;							
var VariableNames = new Array("A","B","C","D");	
var Width  = new Array(0,2,2,4,4);				// width of Kmap for each VariableCount
var Height = new Array(0,2,2,2,4);				// height of Kmap for each VariableCount
var BitOrder = new Array(0,1,3,2);				// bits across and down Kmap
var BackgroundColor="white";
var AllowDontCare=false;						// true doesn't guarantee a minimal solution
var DontCare = "X";

// Variables (initialized here)
var VariableCount=3;							//1..4
var TruthTable = new Array();					// truth table structure[row][variable]
var KMap = new Array();							// KMap[across][down]
var FunctionText = "";							// F(ABC)= 
var EquationHighlightColor = "yellow";			// 0xFFFF00;
var Heavy = 20;

var Equation = new Array();						// solution results 
for (i=0; i<Math.pow(2,MaxVariableCount); i++)
{
	Equation[i] = new Array();					// for each term in result function
	Equation[i].ButtonUIName = "EQ" + i;		// used to generate HTML IDs
	Equation[i].Expression = "";				// HTML text for term 
	Equation[i].Rect = null;					// 'rect' for term 
	Equation.UsedLength=0;						// # of terms in current result function
}
Equation.UsedLength=1;
Equation[0].Expression="0";

// initialize the truth table and kmap structure for the given number of variables
function InitializeTables(VarCount)
{
	TruthTable = new Array();
	KMap = new Array();							

	VariableCount = VarCount;
	KMap.Width=Width[VariableCount];
	KMap.Height=Height[VariableCount];

	for (i=0; i< Math.pow(2,VariableCount); i++)
	{
		TruthTable[i] = new Array();
		TruthTable[i].Index = i;
		TruthTable[i].Name = i.toString(2);
		TruthTable[i].ButtonUIName = "TT"+TruthTable[i].Name;
		TruthTable[i].TTROWUIName = "TTROW" + TruthTable[i].Name;
		for (j=0; j<Math.pow(2,VariableCount); j++)
		{
			TruthTable[i][j] = new Array();
			TruthTable[i][j].Variable = (i & (1<<(VariableCount-(1+j)))?1:0)?true:false;
			TruthTable[i][j].Name = VariableNames[j];
			TruthTable[i][j].KMapEntry = null;
		}
	}

	KMap.XVariables = KMap.Width/2;
	KMap.YVariables = KMap.Height/2;

	for (w=0; w<KMap.Width; w++)
	{
		KMap[w]=new Array();
		for (h=0; h<KMap.Height; h++)
		{
			KMap[w][h]=new Array();
			KMap[w][h].Value = false;
			mapstr = BinaryString(BitOrder[w],KMap.XVariables) + BinaryString(BitOrder[h],KMap.YVariables);
			mapval = parseInt(mapstr,2);
			KMap[w][h].TruthTableEntry = TruthTable[mapval];
			KMap[w][h].TruthTableEntry.KMapEntry = KMap[w][h];
			KMap[w][h].ButtonUIName = "KM" + KMap[w][h].TruthTableEntry.Name;
			KMap[w][h].TDUIName = "TD" + KMap[w][h].TruthTableEntry.Name;
			KMap[w][h].Covered = false;
			KMap[w][h].Variable = new Array();
			for (i=0; i<VariableCount; i++)
			{
				KMap[w][h].Variable[i] = KMap[w][h].TruthTableEntry[i].Variable;
			}
		}
	}

	FunctionText = "F(";
	for (i=0; i<VariableCount; i++)
	{
		FunctionText += VariableNames[i];
	}
	FunctionText+=")";

}

InitializeTables(VariableCount);

// returns a color to use for the backround for a given boolean value 
//    Value is expected to be "1", "0", or "X"
function HighlightColor( Value )
{
	if (Value=="1") return "red";    //0x00FF00;
	if (Value=="0") return "lightgreen"; //~0xFF0000;
	return "gray"; //0x7F7F7F;
}

// returns a color to use for rollover highlighting 
//    Value is expected to be "1", "0", or "X"
function RectHighlightColor( Value )
{
	return EquationHighlightColor;
}

// init code (setup display according to query parameters)
function Load()
{
	if (PageParameter("Variables")=="3")
	{
		ChangeVariableNumber( 3 );
	}
	else if (PageParameter("Variables")=="2")
	{
		ChangeVariableNumber( 2 );
	}
	else if (PageParameter("Variables")=="4")
	{
		ChangeVariableNumber( 4 );
	}
	else 
	{
		ChangeVariableNumber( VariableCount );
	}
	if (PageParameter("DontCare")=="true")
	{
		ToggleDontCare();
	}
}
window.onload = Load;

// constructs a Rect type
function CreateRect( x,y,w,h )
{
	var Obj=new Array();
	Obj.x = x;
	Obj.y = y;
	Obj.w = w;
	Obj.h = h;
	return Obj;
}

// Comparison of two trinary 'boolean' values (a boolean value or don't care)
function Compare( Value1, Value2 )
{
	if ( (Value1 == Value2) || (Value1==DontCare) || (Value2==DontCare) )
	{
		return true;
	}
	else
	{
		return false;
	}
}

// Determines if a Rect with a given value fits on the KMap: it 'fits' if every square of the Rect
// matches (copmares with) the TestValue.
// Assumes top left of Rect is within the KMap.
// Assumes Rect is not larger than KMap
function TestRect( Rect, TestValue )
{
	var dx=0;
	var dy=0;
	for (dx=0; dx<Rect.w; dx++)
	{
		for (dy=0; dy<Rect.h; dy++)
		{
			var Test = KMap[(Rect.x+dx)%KMap.Width][(Rect.y+dy)%KMap.Height].Value;
			if (!Compare(TestValue,Test))
			{
				return false;
			}
		}
	}
	return true;
}

// Returns true if for every square of the Rect in the KMap, the .Covered flag is set
//    or the value of the square is don't care.
function IsCovered( Rect )
{
	var dx=0;
	var dy=0;
	for (dx=0; dx<Rect.w; dx++)
	{
		for (dy=0; dy<Rect.h; dy++)
		{
			if (!KMap[(Rect.x+dx)%KMap.Width][(Rect.y+dy)%KMap.Height].Covered) 
			{
				//treat dont care's as already covered
				if (!(KMap[(Rect.x+dx)%KMap.Width][(Rect.y+dy)%KMap.Height].Value==DontCare))
				{
					return false;
				}
			}
		}
	}
	return true;
}

// Sets the .Covered flag for every square of the Rect in the KMap
function Cover( Rect, IsCovered )
{
	var dx=0;
	var dy=0;
	for (dx=0; dx<Rect.w; dx++)
	{
		for (dy=0; dy<Rect.h; dy++)
		{
			KMap[(Rect.x+dx)%KMap.Width][(Rect.y+dy)%KMap.Height].Covered = IsCovered;
		}
	}
}

// Tries every x,y location in the KMap to see if the given rect size (w,h) will fit there
//   (matches in value).  For each location that fits, creates a rect and adds it to the Found 
//   array.  If DoCover is true, also sets the KMap .Cover flag for the rects that fit.
function SearchRect( w,h, TestValue, Found, DoCover )
{
	if ((w>KMap.Width) || (h>KMap.Height))
	{
		return;  // rect is too large
	}
		
	var x=0;
	var y=0;
	var across = (KMap.Width==w) ?1:KMap.Width;
	var down   = (KMap.Height==h)?1:KMap.Height;
	for (x=0; x<across; x++)
	{
		for (y=0; y<down; y++)
		{
			var Rect = CreateRect(x,y,w,h);
			if (TestRect(Rect,TestValue))
			{
				if (!IsCovered(Rect))
				{
					Found[Found.length]=Rect;
					if (DoCover) Cover(Rect, true);
				}
			}
		}
	}
}

// Iterates through an array of Rects (in order) to determine which of them
//  cover something in the KMap and which don't (because previous ones already
//  have covered enough).  Adds rects that do cover something to the Used array.
function TryRects(Rects,Used)
{
    var j = 0;
    for (j = 0; j < Rects.length; j++)
    {
        var Rect = Rects[j];
        if (TestRect(Rect, true))
        {
            if (!IsCovered(Rect))
            {
                Used[Used.length] = Rect;
                Cover(Rect, true);
            }
        }
    }
}

// Adds the given Weight to every element of the Weights map that corresponds to the Rect.
function AddRectWeight(Weights, Rect, Weight)
{
    var dx = 0;
    var dy = 0;
    for (dx = 0; dx < Rect.w; dx++)
    {
        for (dy = 0; dy < Rect.h; dy++)
        {
            Weights[(Rect.x + dx) % KMap.Width][(Rect.y + dy) % KMap.Height] += Weight;
        }
    }
}


// Retrieves a weight value of a rect, by summing the weight of each square in the Weights
// map that correspond to the Rect
function GetRectWeight(Weights, Rect)
{
    var dx = 0;
    var dy = 0;
    var W = 0;
    for (dx = 0; dx < Rect.w; dx++)
    {
        for (dy = 0; dy < Rect.h; dy++)
        {
            W += Weights[(Rect.x + dx) % KMap.Width][(Rect.y + dy) % KMap.Height];
        }
    }
    return W;
}


// Used for the array sorting function to sort objects by each object's .Weight member 
function SortByWeight(a, b)
{
    if (a.Weight < b.Weight) return -1;
    else if (a.Weight > b.Weight) return 1;
    else return 0;
}

// Returns true if two Rects overlap (share any squares)
function OverlappingRects(R1,R2)
{
    if ( (R1.x+R1.w>R2.x) && 
         ((R2.x+R2.w)>(R1.x)) &&
         (R1.y+R1.h>R2.y) && 
         ((R2.y+R2.h)>(R1.y))
        )
        return true;
    return false;
}

// Sorts a list of Rects that cover squares of the KMap, and returns a minimal
// subset of those Rects that cover the same squares
function FindBestCoverage(Rects,AllRects)
{
    // create a 'Weight' map
    var Weights = new Array();
    for (w = 0; w < KMap.Width; w++)
    {
        Weights[w] = new Array();
        for (h = 0; h < KMap.Height; h++)
        {   // initial weight is 0 if not already covered, high if already covered
            Weights[w][h] = (KMap[w][h].Covered)?Heavy:0;
        }
    }
    // seed the weight map with 1 for every square covered by every Rect
    var i = 0;
    for (i = 0; i < Rects.length; i++)
    {
        AddRectWeight(Weights, Rects[i], 1);
    }

    // generate a set of rects sorted by weight - but  after selecting each minimal
    // weighted rect, re-weight the map for the next selection.  Re-weight by
    // making the squares of the selected Rect very heavy, but reduce the
    // weight of any squares for Rects that overlap the selected Rect.  This has the
    // effect of pushing the rects that duplicate KMap coverage to the back of the list, 
    // while bubbling non-overlapping maximal covering rects to the front.
    var SortedRects = new Array();
    while (Rects.length>0)
    {
        var j=0;
        for (j = 0; j < Rects.length; j++)
        {   // get the weight for the remaining Rects
            Rects[j].Weight = GetRectWeight(Weights, Rects[j]);
        }
        // Sort the array to find a Rect with minimal weight
        Rects.sort(SortByWeight);
        SortedRects.push(Rects[0]);
        if (Rects.length == 1)
        {   // just found the last Rect, break out
            break;
        }
        // Make the weight map very heavy for the selected Rect…*/