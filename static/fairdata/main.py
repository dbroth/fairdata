# Tony Tuttle
# March 2016
# tuttle.tony@gmail.com

import os.path
import weka.core.jvm as jvm
from weka.core.converters import Loader
from weka.filters import Filter
from weka.classifiers import Classifier
import weka.plot.graph as graph

def run_classifier(path, prot, sel, cols, prot_vals, beta):
        
    DIs = dict()
    jvm.start()

    for i in range(len(cols)-1):
        loader = Loader(classname="weka.core.converters.CSVLoader")
        data = loader.load_file(path)
    
        # remove selected attribute from the data
        # NOTE: options are ONE indexed, not ZERO indexed
        remove = Filter(classname="weka.filters.unsupervised.attribute.Remove", \
                        options=["-R", str(sel[2]+1)])
        remove.inputformat(data)
        data = remove.filter(data)

        # if running for only one attribue, remove all others (except protected)
        if i > 0:
            for j in range(1, prot[2]+1):
                if i != j:
                    remove = Filter(classname="weka.filters.unsupervised.attribute.Remove", \
                                    options=["-R", ("1" if i>j else "2")])
                    remove.inputformat(data)
                    data = remove.filter(data)

        # set prot attribute as Class attribute
        data.class_is_last()
        
        # run classifier
        cls = Classifier(classname="weka.classifiers.bayes.NaiveBayes")
        cls.build_classifier(data)
    
        # count the number of each combination
        pos_and_pred = float(0.0)
        pos_and_not_pred = float(0.0)
        neg_and_pred = float(0.0)
        neg_and_not_pred = float(0.0)
        for ind, inst in enumerate(data):
            if cls.classify_instance(inst):
                if prot_vals[ind] == prot[1]:
                    pos_and_pred += 1
                else:
                    neg_and_pred += 1
            else:
                if prot_vals[ind] == prot[1]:
                    pos_and_not_pred += 1
                else:
                    neg_and_not_pred += 1

        # calculate DI
        BER = ((pos_and_not_pred / (pos_and_pred + pos_and_not_pred)) + \
               (neg_and_pred / (neg_and_pred + neg_and_not_pred))) * 0.5
        if BER > 0.5:
            BER = 1 - BER
        DI = 1 - ((1 - 2 * BER) / (beta + 1 - 2 * BER))

        if i == 0: # consider changing this to a 'code word' instead of 'all'
            DIs["all"] = DI
        else:
            DIs[cols[i-1]] = DI

    jvm.stop()

    return DIs


def read_file(path, prot, sel):

    # **********************************************************************
    # ******************************** TODO ********************************
    # ** change this so it rearranges the columns of the csv to ensure *****
    # ** that the protected column is penultimate and the selected column **
    # ** is last ***********************************************************
    # **********************************************************************

    # open the file and look for match for protected and selected attributes
    imc = 0
    saimc = 0
    protected_vals = []
    with open(path, 'r') as f:
        col_names = f.readline().rstrip().split(',')
        
        if not prot[0] in col_names:
            raise ValueError("Protected attribute " + prot[0] + " not found.")
        prot.append(col_names.index(prot[0]))
        if not sel[0] in col_names:
            raise ValueError("Selected attribute " + sel[0] + " not found.")
        sel.append(col_names.index(sel[0]))
        
        # calculate:
        # > imc = |minority_attr|
        # > saimc = |minority_attr ^ selected_attr|
        # > beta = saimc / imc
        # > BERt = 0.5 - beta/8
        for l in f:
            l_lst = l.rstrip().split(',')
            protected_vals.append(l_lst[prot[2]])
            if l_lst[prot[2]] == prot[1]:
                imc += 1
                if l_lst[sel[2]] == sel[1]:
                    saimc += 1

    beta = float(saimc) / float(imc)

    return col_names, beta, protected_vals
    

# csv_path is a path to the csv file that contains our data
#
# protected is a list that contains (in order) the name of the protected attribute and the
# 'positive' value
# selected is a list that contains (in order) the name of the selected attribute and the
# 'positive' value
def run(csv_path, protected, selected):

    # verify path is good
    if not os.path.isfile(csv_path):
        raise IOError("File not found: " + csv_path)
    
    col_names, beta, protected_vals = read_file(csv_path, protected, selected)

    return run_classifier(csv_path, protected, selected, col_names, protected_vals, beta)
